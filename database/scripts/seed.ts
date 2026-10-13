import 'dotenv/config';
import mongoose from 'mongoose';
import { sampleSkills } from '../seeds/skills.seed';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerpulse';

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

const Skill = mongoose.model('Skill', SkillSchema);

async function runSeed() {
  console.log(`[Seed] Connecting to MongoDB at ${MONGODB_URI}...`);
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('[Seed] Connected to MongoDB.');

    console.log(`[Seed] Seeding ${sampleSkills.length} skills...`);
    for (const skill of sampleSkills) {
      await Skill.updateOne({ name: skill.name }, { $set: skill }, { upsert: true });
    }

    console.log('[Seed] ✅ Skills seeded successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.warn('[Seed] Notice: Could not connect to MongoDB.');
    console.warn('[Seed] Printing sample seed data for inspection:');
    console.log(JSON.stringify(sampleSkills, null, 2));
    process.exit(0);
  }
}

runSeed();
