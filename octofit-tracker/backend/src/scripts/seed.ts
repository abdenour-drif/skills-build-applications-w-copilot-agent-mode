import mongoose, { Types } from 'mongoose';
import { Activity, LeaderboardEntry, Team, User, Workout } from '../models/index.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

const teamSeeds = [
  { name: 'Trailblazers', description: 'Steady miles and outdoor adventures' },
  { name: 'Pace Setters', description: 'Building consistency one workout at a time' },
];

const userSeeds = [
  { username: 'maya.chen', email: 'maya.chen@example.com', firstName: 'Maya', lastName: 'Chen', teamName: 'Trailblazers' },
  { username: 'ava.patel', email: 'ava.patel@example.com', firstName: 'Ava', lastName: 'Patel', teamName: 'Trailblazers' },
  { username: 'noah.williams', email: 'noah.williams@example.com', firstName: 'Noah', lastName: 'Williams', teamName: 'Pace Setters' },
  { username: 'leo.kim', email: 'leo.kim@example.com', firstName: 'Leo', lastName: 'Kim', teamName: 'Pace Setters' },
];

const activitySeeds = [
  { username: 'maya.chen', activityType: 'running', durationMinutes: 32, distanceKilometers: 5.2, points: 52, completedAt: new Date('2026-10-05T16:00:00.000Z') },
  { username: 'maya.chen', activityType: 'walking', durationMinutes: 25, distanceKilometers: 2, points: 20, completedAt: new Date('2026-10-06T16:00:00.000Z') },
  { username: 'ava.patel', activityType: 'strength training', durationMinutes: 40, points: 40, completedAt: new Date('2026-10-05T17:00:00.000Z') },
  { username: 'noah.williams', activityType: 'cycling', durationMinutes: 45, distanceKilometers: 14, points: 45, completedAt: new Date('2026-10-04T16:30:00.000Z') },
  { username: 'leo.kim', activityType: 'walking', durationMinutes: 30, distanceKilometers: 2.8, points: 30, completedAt: new Date('2026-10-04T17:00:00.000Z') },
];

const workoutSeeds = [
  { title: 'After-school interval run', description: 'A short warm-up followed by six brisk intervals.', activityType: 'running', durationMinutes: 30, difficulty: 'intermediate' },
  { title: 'Bodyweight strength circuit', description: 'A balanced circuit of squats, push-ups, and planks.', activityType: 'strength training', durationMinutes: 25, difficulty: 'beginner' },
  { title: 'Recovery walk', description: 'An easy-paced walk to support active recovery.', activityType: 'walking', durationMinutes: 20, difficulty: 'beginner' },
];

/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to octofit_db');
    console.log('Seed the octofit_db database with test data');

    const teamsByName = new Map();
    for (const teamSeed of teamSeeds) {
      const team = await Team.findOneAndUpdate(
        { name: teamSeed.name },
        { $set: teamSeed },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );
      teamsByName.set(team.name, team);
    }

    const usersByUsername = new Map();
    for (const userSeed of userSeeds) {
      const team = teamsByName.get(userSeed.teamName);
      const user = await User.findOneAndUpdate(
        { username: userSeed.username },
        {
          $set: {
            username: userSeed.username,
            email: userSeed.email,
            firstName: userSeed.firstName,
            lastName: userSeed.lastName,
            team: team._id,
          },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );
      usersByUsername.set(user.username, user);
    }

    const membersByTeam = new Map<string, Types.ObjectId[]>(
      teamSeeds.map(({ name }) => [name, [] as Types.ObjectId[]]),
    );
    for (const userSeed of userSeeds) {
      membersByTeam.get(userSeed.teamName)?.push(usersByUsername.get(userSeed.username)._id);
    }
    for (const teamSeed of teamSeeds) {
      const team = teamsByName.get(teamSeed.name);
      team.members = membersByTeam.get(teamSeed.name);
      await team.save();
    }

    const pointsByUser = new Map<string, number>(userSeeds.map(({ username }) => [username, 0]));
    for (const activitySeed of activitySeeds) {
      const user = usersByUsername.get(activitySeed.username);
      const { username, ...activityFields } = activitySeed;
      await Activity.findOneAndUpdate(
        { user: user._id, activityType: activityFields.activityType, completedAt: activityFields.completedAt },
        { $set: { ...activityFields, user: user._id } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );
      pointsByUser.set(username, (pointsByUser.get(username) ?? 0) + activityFields.points);
    }

    const rankedUsers = userSeeds
      .map(({ username }) => ({ user: usersByUsername.get(username), points: pointsByUser.get(username) ?? 0 }))
      .sort((left, right) => right.points - left.points);

    for (const [index, rankedUser] of rankedUsers.entries()) {
      await LeaderboardEntry.findOneAndUpdate(
        { user: rankedUser.user._id, period: 'all-time' },
        { $set: { user: rankedUser.user._id, points: rankedUser.points, rank: index + 1, period: 'all-time' } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );
    }

    const pointsByTeam = new Map<string, number>(teamSeeds.map(({ name }) => [name, 0]));
    for (const userSeed of userSeeds) {
      const teamPoints = pointsByTeam.get(userSeed.teamName) ?? 0;
      const userPoints = pointsByUser.get(userSeed.username) ?? 0;
      pointsByTeam.set(userSeed.teamName, teamPoints + userPoints);
    }
    for (const teamSeed of teamSeeds) {
      await Team.updateOne({ name: teamSeed.name }, { $set: { points: pointsByTeam.get(teamSeed.name) } });
    }

    for (const workoutSeed of workoutSeeds) {
      await Workout.findOneAndUpdate(
        { title: workoutSeed.title },
        { $set: workoutSeed },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );
    }

    console.log(`Seeded ${userSeeds.length} users, ${teamSeeds.length} teams, ${activitySeeds.length} activities, ${rankedUsers.length} leaderboard entries, and ${workoutSeeds.length} workouts`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedDatabase();
