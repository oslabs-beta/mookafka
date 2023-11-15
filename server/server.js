const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');
const path = require('path');
const app = express();
const PORT = 1234;
const kafkaController = require('./controllers/kafkacontroller.js');

app.use(bodyParser.urlencoded());
app.use(express.json());

//get request on connect button
app.get('/connect', kafkaController.connectButton, (req, res) => {
  res.status(200);
});

// app.get('/brokers', kafkaController.displayBrokers, (req, res) => {
//   res.status(200);
// })

app.get(
  '/topics&partitions',
  kafkaController.displayTopicsAndPartitions,
  (req, res) => {
    res.status(200);
  },
);

app.get(
  '/producers&consumers',
  kafkaController.displayProducersAndConsumers,
  (req, res) => {
    res.status(200);
  },
);

app.get('/alerts', kafkaController.displayAlerts, (req, res) => {
  res.status(200);
});

const kafka = new Kafka({
  clientId: 'kafkabroker1',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'test-group' });

app.get('/getmessages', async (req, res) => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'test-events', fromBeginning: true });

  const messages = [];
  await consumer.run({
    eachMessage: async ({ message }) => {
      messages.push(message.value.toString());
      console.log({
        value: message.value.toString(),
      });
    },
  });

  await consumer.disconnect();

  console.log(messages);
  res.json(messages);
});

//unknown route error
app.use((err, req, res, next) => {
  res.status(404).send('Page not found');
});

//global error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Global error',
    status: 500,
    message: 'Error caught',
  };
  const errorObj = Object.assign(defaultErr, err);
  return res.status(errorObj.status).json(errorObj.message);
});

// test code for merge test

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));

module.exports = app;
