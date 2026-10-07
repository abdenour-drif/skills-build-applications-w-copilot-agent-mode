import { model, Schema } from 'mongoose';

const leaderboardSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true, default: 0, min: 0 },
    rank: { type: Number, min: 1 },
    period: { type: String, default: 'all-time', trim: true },
  },
  { timestamps: true },
);

export default model('Leaderboard', leaderboardSchema, 'leaderboard');