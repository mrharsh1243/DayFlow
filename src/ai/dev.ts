import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-tasks.ts';
import '@/ai/flows/schedule-locked-time.ts';
import '@/ai/flows/generate-smart-schedule.ts';
