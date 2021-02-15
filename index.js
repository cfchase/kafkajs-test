const KAFKA_BOOTSTRAP_SERVER = ''
const KAFKA_SECURITY_PROTOCOL = 'SASL_SSL'
const KAFKA_SASL_MECHANISM = 'PLAIN'
const KAFKA_USERNAME = ''
const KAFKA_PASSWORD = ''
const KAFKA_TOPIC =  'jstest';


const { Kafka, logLevel } = require('kafkajs')
const sasl = KAFKA_USERNAME && KAFKA_PASSWORD
  ? {
    username: KAFKA_USERNAME,
    password: KAFKA_PASSWORD,
    mechanism: KAFKA_SASL_MECHANISM.toLowerCase(),
  }
  : null;

const ssl = !!sasl;
// const ssl = {
//   rejectUnauthorized: false
// };

const kafkaConfig = {
  clientId: `kafkajs-test-app`,
  brokers: [KAFKA_BOOTSTRAP_SERVER],
  connectionTimeout: 15000,
  authenticationTimeout: 15000,
  reauthenticationThreshold: 10000,
  logLevel: logLevel.DEBUG,
  retry: {
    initialRetryTime: 100,
    retries: 8
  },
  ssl,
  sasl
};

console.log(kafkaConfig);
const kafka = new Kafka(kafkaConfig)
const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: `kafkajs-${KAFKA_TOPIC}-consumer` })

const run = async () => {
  // Producing
  await producer.connect()
  await producer.send({
    topic: KAFKA_TOPIC,
    messages: [
      { value: 'Hello KafkaJS!' },
    ],
  })

  // Consuming
  await consumer.connect()
  await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      })
    },
  })
}

run().catch(console.error)