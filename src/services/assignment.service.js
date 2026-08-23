const OPERATIONS_SERVICE_URL =
  process.env.OPERATIONS_SERVICE_URL ||
  "http://localhost:4001";

async function trainerHasCustomer(
  trainerId,
  customerId,
) {
  const url =
    `${OPERATIONS_SERVICE_URL}/operations/trainers/` +
    `${encodeURIComponent(trainerId)}/has-customer/` +
    `${encodeURIComponent(customerId)}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    return data === true;
  } catch (error) {
    console.error(
      "Failed to verify trainer-customer assignment:",
      error.message,
    );

    return false;
  }
}

module.exports = {
  trainerHasCustomer,
};
