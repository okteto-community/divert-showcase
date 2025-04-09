import { Kafka } from "kafkajs";

const kafkaBroker = process.env.KAFKA_BROKER || "kafka:9092";
const kafkaTopic = process.env.KAFKA_TOPIC || "messages";
const oktetoDivertHeader = "baggage.okteto-divert";
const divertKey = getDivertKey();

const kafka = new Kafka({
  clientId: "consumer-service",
  brokers: [kafkaBroker],
});

// each environment has a different groupId to allow all environments from consuming from the same kafka queue
const consumer = kafka.consumer({
  groupId: `consumer-service-${divertKey}`,
  topic: kafkaTopic,
  allowAutoTopicCreation: true,
});

function getDivertKey() {
  return process.env.OKTETO_NAMESPACE;
}

// each environment has a different groupId to allow all environments from consuming from the same kafka queue
function shouldConsumeMessage(headers) {
  if (headers == undefined) {
    return false;
  }

  // TODO: return true if not in a diverted scenario, then check the headers
  if (headers[oktetoDivertHeader] == divertKey) {
    return true;
  }

  console.log(
    `Skipping message since it has divertKey ${headers["baggage.okteto-divert"]}`,
  );

  return false;
}

export async function startConsumer(messageCallback) {
  console.log("🟢 Starting consumer");
  const { GROUP_JOIN, STOP } = consumer.events;
  consumer.on(GROUP_JOIN, (e) => console.log(`🏘️  Consumer joined the group`));
  consumer.on(STOP, (e) => {
    console.log(`🔴 Consumer stopped`);
    process.exit(1);
  });

  await consumer.connect();
  await consumer.subscribe({ topic: "messages" });

  await consumer.run({
    eachBatchAutoResolve: false,
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      let messageJson = JSON.parse(message.value.toString());
      const { headers, text } = messageJson;
      if (shouldConsumeMessage(headers)) {
        messageCallback(text);
        await consumer.commitOffsets([
          { topic, partition, offset: message.offset },
        ]);
      }
    },
  });
}
