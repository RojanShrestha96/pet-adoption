import mongoose from "mongoose";
import dotenv from "dotenv";
import "./models/User.js";
import "./models/Shelter.js";
import "./models/Pet.js";
import * as FinalizationService from "./services/adoptionFinalizationService.js";
import AdoptionApplication from "./models/AdoptionApplication.js";

dotenv.config();

async function runTest() {
  console.log("Connecting to DB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");
  
  const app = await AdoptionApplication.findOne({ status: "payment_pending" });
  if (!app) {
    console.log("No application in payment_pending state found to test.");
    process.exit(0);
  }

  console.log(`Found application ${app._id} for adopter ${app.adopter}. Simulating initiateAdoptionPayment...`);
  try {
    const result = await FinalizationService.initiateAdoptionPayment(app._id, app.adopter);
    console.log("SUCCESS:", result);
  } catch (err) {
    console.error("FAILED WITH ERROR:", err.message);
    import('fs').then(fs => fs.writeFileSync('error.txt', err.stack));
  }
  
  process.exit(1);
}

runTest();
