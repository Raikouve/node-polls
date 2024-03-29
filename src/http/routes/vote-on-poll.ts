import z from "zod";
import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/poll/:pollId/votes', async (req, res) => {
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid()
    });

    const voteOnPollParams = z.object({
      pollId: z.string().uuid()
    });

    const { pollId } = voteOnPollParams.parse(req.params);
    const { pollOptionId } = voteOnPollBody.parse(req.body);

    let { sessionId } = req.cookies;

    if (sessionId) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId
          }
        }
      });

      if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId !== pollOptionId) {
        // Apagar o voto anterior
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id
          }
        });
        // Criar um novo voto
      } else if (userPreviousVoteOnPoll) {
        return res.status(400).send({ message: 'You already voted on this poll.' });
      }
    }

    if (!sessionId) {      
      sessionId = randomUUID();

      res.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        signed: true,
        httpOnly: true
      });
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId
      }
    });

    return res.status(201).send({ sessionId });
  });
}