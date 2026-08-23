const { Kafka } = require("kafkajs");

const KAFKA_BROKERS = (
  process.env.KAFKA_BROKERS || "localhost:9092"
).split(",");

const kafka = new Kafka({
  clientId: "gym-progress-service",
  brokers: KAFKA_BROKERS,
});

const producer = kafka.producer();

let connected = false;

async function connectPlanProducer() {
  if (connected) {
    return;
  }

  try {
    await producer.connect();
    connected = true;
    console.log(
      "Progress service plan-events producer connected to Kafka",
    );
  } catch (error) {
    /*
     * Kafka being down must never stop the API.
     * Publishing attempts are skipped until a later
     * retry succeeds.
     */
    connected = false;
    console.error(
      "Failed to connect plan-events producer to Kafka:",
      error.message,
    );
  }
}

/*
 * Fire-and-forget publish. Failures are logged and
 * swallowed so the main request flow is unaffected.
 */
async function publishPlanEvent(topic, event) {
  try {
    await connectPlanProducer();

    if (!connected) {
      return;
    }

    await producer.send({
      topic,
      messages: [
        {
          key: event.plan?.customer_id || null,
          value: JSON.stringify(event),
        },
      ],
    });
  } catch (error) {
    console.error(
      `Failed to publish plan event to ${topic}:`,
      error.message,
    );
  }
}

const EXERCISE_PLAN_EVENTS =
  process.env.EXERCISE_PLAN_EVENTS_TOPIC ||
  "EXERCISE_PLAN_EVENTS";

const NUTRITION_PLAN_EVENTS =
  process.env.NUTRITION_PLAN_EVENTS_TOPIC ||
  "NUTRITION_PLAN_EVENTS";

module.exports = {
  producer,
  connectPlanProducer,
  publishPlanEvent,
  EXERCISE_PLAN_EVENTS,
  NUTRITION_PLAN_EVENTS,
};
