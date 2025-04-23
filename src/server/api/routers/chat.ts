import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { conversations, items, messages, users } from "~/server/db/schema";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { emailService } from "~/server/email/service";

export const chatRouter = createTRPCRouter({
  // Start a new conversation
  startConversation: protectedProcedure
    .input(
      z.object({
        sellerId: z.string(),
        itemId: z.number(),
        initialMessage: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure the user is authenticated
      const userId = ctx.session.user.id;

      // Check if conversation already exists between these users for this item
      const existingConversation = await ctx.db.query.conversations.findFirst({
        where: and(
          eq(conversations.buyerId, userId),
          eq(conversations.sellerId, input.sellerId),
          eq(conversations.itemId, input.itemId),
        ),
      });

      if (existingConversation) {
        // If it exists, add a new message to it
        const newMessage = await ctx.db
          .insert(messages)
          .values({
            conversationId: existingConversation.id,
            senderId: userId,
            content: input.initialMessage,
          })
          .returning();

        return { conversation: existingConversation, message: newMessage[0] };
      }

      // Create a new conversation
      const newConversation = await ctx.db
        .insert(conversations)
        .values({
          buyerId: userId,
          sellerId: input.sellerId,
          itemId: input.itemId,
        })
        .returning();

      if (!newConversation[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create conversation",
        });
      }

      // Add the initial message
      const newMessage = await ctx.db
        .insert(messages)
        .values({
          conversationId: newConversation[0].id,
          senderId: userId,
          content: input.initialMessage,
        })
        .returning();

        //Send an email
        const baseUrl = ctx.headers?.origin ?? "http://localhost:3000";
        const seller = await ctx.db.query.users.findFirst({
          where: eq(users.id, input.sellerId),
        });
        const buyer = await ctx.db.query.users.findFirst({
          where: eq(users.id, userId)
        });
        const item = await ctx.db.query.items.findFirst({
          where: eq(items.id, input.itemId)
        });

        if(!seller) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to find SELLER."
          })
        }
        if(!buyer) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to find BUYER."
          })
        }
        if(!item) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to find ITEM."
          })
        }

        emailService.sendSoldNotificationEmail(seller.email, baseUrl, buyer.name!, item.name!, item.id, input.initialMessage);

      return { conversation: newConversation[0], message: newMessage[0] };
    }),

  // Send a new message in an existing conversation
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if the conversation exists and the user is part of it
      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // Check if the current user is part of this conversation
      if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of this conversation",
        });
      }

      // Create the message
      const newMessage = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: userId,
          content: input.content,
        })
        .returning();

      // Update the conversation's updatedAt timestamp
      await ctx.db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return newMessage[0];
    }),

  // Get all conversations for the current user
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all conversations where the user is either the buyer or seller
    const userConversations = await ctx.db.query.conversations.findMany({
      where: or(
        eq(conversations.buyerId, userId),
        eq(conversations.sellerId, userId),
      ),
      with: {
        buyer: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        seller: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        item: true,
      },
      orderBy: desc(conversations.updatedAt),
    });

    // For each conversation, get the last message and unread count
    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (conversation) => {
        // Get the latest message
        const latestMessage = await ctx.db.query.messages.findFirst({
          where: eq(messages.conversationId, conversation.id),
          orderBy: desc(messages.createdAt),
        });

        // Count unread messages (where the sender is not the current user and they haven't been read)
        const unreadCount = await ctx.db
          .select({ count: messages })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conversation.id),
              eq(messages.read, 0),
              eq(
                messages.senderId,
                userId === conversation.buyerId
                  ? conversation.sellerId
                  : conversation.buyerId,
              ),
            ),
          )
          .then((result) => result.length);

        return {
          ...conversation,
          latestMessage,
          unreadCount,
        };
      }),
    );

    return conversationsWithDetails;
  }),

  // Get messages for a specific conversation
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if the conversation exists and the user is part of it
      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // Check if the current user is part of this conversation
      if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not part of this conversation",
        });
      }

      // Get messages with sender info
      const chatMessages = await ctx.db.query.messages.findMany({
        where: eq(messages.conversationId, input.conversationId),
        with: {
          sender: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: asc(messages.createdAt),
      });

      // Mark messages as read if the current user is receiving them
      const messagesToMarkAsRead = chatMessages.filter(
        (msg) => msg.senderId !== userId && !msg.read,
      );

      if (messagesToMarkAsRead.length > 0) {
        const messageIds = messagesToMarkAsRead.map((msg) => msg.id);

        await Promise.all(
          messageIds.map(async (id) => {
            await ctx.db
              .update(messages)
              .set({ read: 1 })
              .where(eq(messages.id, id));
          }),
        );
      }

      return chatMessages;
    }),

  // Get unread message count for the current user
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get conversations where user is either buyer or seller
    const userConversations = await ctx.db.query.conversations.findMany({
      where: or(
        eq(conversations.buyerId, userId),
        eq(conversations.sellerId, userId),
      ),
      columns: {
        id: true,
        buyerId: true,
        sellerId: true,
      },
    });

    // Count unread messages across all conversations
    let totalUnread = 0;

    for (const conversation of userConversations) {
      const otherUserId =
        userId === conversation.buyerId
          ? conversation.sellerId
          : conversation.buyerId;

      const unreadMessages = await ctx.db.query.messages.findMany({
        where: and(
          eq(messages.conversationId, conversation.id),
          eq(messages.senderId, otherUserId),
          eq(messages.read, 0),
        ),
      });

      totalUnread += unreadMessages.length;
    }

    return { count: totalUnread };
  }),
});
