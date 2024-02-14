import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { createPoll } from './routes/create-poll';
import { getPoll } from './routes/get-poll';
import { voteOnPoll } from './routes/vote-on-poll';

const PORT = 5000;

const app = fastify();

app.register(cookie, {
  secret: "polls-app-secret", // for cookies signature
  hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
});

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);

app.listen({ port: PORT }).then(() => console.log(`HTTP Server Running on port ${PORT}.`));