const { GraphQLError } = require("graphql");
const User = require("./models/user");
const Roadmap = require("./models/roadmap");
const Section = require("./models/section");
const Upcoming = require("./models/upcoming");
const Poll = require("./models/poll");
const jwt = require("jsonwebtoken");
const Enrolled = require("./models/enrolled");
const bcrypt = require("bcryptjs");

const resolvers = {
  Query: {
    me: (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("Authentication required");
      }
      return context.currentUser;
    },
    allUsers: async () => {
      return User.find({}).populate({
        path: "progress.roadmap",
        populate: {
          path: "sections",
        },
      });
    },
    allRoadmaps: async (root, args) => {
      const { includeDrafts } = args;
      const filter = includeDrafts ? {} : { draft: false };
      return Roadmap.find(filter).populate("sections");
    },
    allUpcomingRoadmaps: async () => {
      return Upcoming.find({});
    },
    getPoll: async (root, { id }) => {
      return Poll.findById(id).populate("options");
    },
    getAllPolls: async (root, id) => {
      return Poll.find({}).populate("options");
    },
    getAllEnrolledUsers: async () => {
      return Enrolled.find({});
    },
  },
  Mutation: {
    createUser: async (root, args) => {
      const { username, password, isAdmin } = args;

      if (!username || !password) {
        throw new GraphQLError("Username and password are required");
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new GraphQLError("Username already exists");
      }

      const isEnrolled = await Enrolled.findOne({ name: username });

      if (isEnrolled) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const user = new User({
          username,
          passwordHash,
          isAdmin: isAdmin || false,
          progress: [],
        });

        return user.save().catch((error) => {
          throw new GraphQLError("Creating the user failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.username,
              error,
            },
          });
        });
      } else {
        throw new GraphQLError("Username not added to system");
      }
    },
    login: async (root, args) => {
      const { username, password } = args;
      const user = await User.findOne({ username });

      if (!user) {
        throw new GraphQLError("User not found");
      }

      const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

      if (!passwordCorrect) {
        throw new GraphQLError("Invalid password");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
        isAdmin: user.isAdmin,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
    createRoadmap: async (root, args, context) => {
      const { title, description, image, sections, draft } = args;
      const currentUser = context.currentUser;

      if (!currentUser || !currentUser.isAdmin) {
        throw new GraphQLError("Only admins can create roadmaps");
      }

      if (
        !title ||
        !description ||
        !image ||
        !sections ||
        sections.length === 0
      ) {
        throw new GraphQLError(
          "All fields are required and sections cannot be empty"
        );
      }

      const sectionsToCreate = await Promise.all(
        sections.map(async (section) => {
          const { modules } = section;

          const modulesToSave = modules.map((module) => ({
            title: module.title,
            content: module.content,
          }));

          const newSection = new Section({
            ...section,
            modules: modulesToSave,
          });

          return newSection.save();
        })
      );

      const roadmapToSave = new Roadmap({
        title,
        description,
        image,
        sections: sectionsToCreate.map((section) => section._id),
        draft,
      });

      return roadmapToSave.save();
    },

    createUpcomingRoadmap: async (root, args, context) => {
      const { title, description, image } = args;
      const currentUser = context.currentUser;

      if (!currentUser || !currentUser.isAdmin) {
        throw new GraphQLError("Only admins can create roadmaps");
      }

      if (!title || !description || !image) {
        throw new GraphQLError(
          "All fields are required and sections cannot be empty"
        );
      }

      const upcomingRoadmapToSave = new Upcoming({
        title,
        description,
        image,
      });

      return upcomingRoadmapToSave.save();
    },
    publishRoadmap: async (root, args, context) => {
      const { roadmapId } = args;
      const currentUser = context.currentUser;

      if (!currentUser || !currentUser.isAdmin) {
        throw new GraphQLError("Only admins can publish roadmaps");
      }

      const roadmap = await Roadmap.findById(roadmapId);
      if (!roadmap) {
        throw new GraphQLError("Roadmap not found");
      }

      if (!roadmap.draft) {
        throw new GraphQLError("Roadmap is already published");
      }

      roadmap.draft = false;
      return roadmap.save();
    },
    enrollUser: async (root, args, context) => {
      const { roadmapId } = args;
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("Authentication required");
      }

      const roadmap = await Roadmap.findById(roadmapId);
      if (!roadmap) {
        throw new GraphQLError("Roadmap not found");
      }

      if (roadmap.draft) {
        throw new GraphQLError("Cannot enroll in a draft roadmap");
      }

      const user = await User.findById(currentUser.id);
      if (!user) {
        throw new GraphQLError("User not found");
      }

      const isEnrolled = user.progress.some(
        (enrolledRoadmap) => enrolledRoadmap.roadmap.toString() === roadmapId
      );

      if (isEnrolled) {
        throw new GraphQLError("User already enrolled in this roadmap");
      }

      user.progress.push({
        roadmap: roadmap._id,
        completedSections: [],
      });
      return user.save();
    },
    completeSection: async (root, args, context) => {
      const { roadmapId, sectionId } = args;
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("Authentication required");
      }

      const user = await User.findById(currentUser.id);
      if (!user) {
        throw new GraphQLError("User not found");
      }

      const enrolledRoadmap = user.progress.find(
        (er) => er.roadmap.toString() === roadmapId
      );

      if (!enrolledRoadmap) {
        throw new GraphQLError("User is not enrolled in this roadmap");
      }

      const roadmap = await Roadmap.findById(roadmapId).populate("sections");
      if (!roadmap) {
        throw new GraphQLError("Roadmap not found");
      }

      const sectionExists = roadmap.sections.some(
        (section) => section._id.toString() === sectionId
      );
      if (!sectionExists) {
        throw new GraphQLError("Section not found in the roadmap");
      }

      if (enrolledRoadmap.completedSections.includes(sectionId)) {
        throw new GraphQLError("Section already completed");
      }

      enrolledRoadmap.completedSections.push(sectionId);
      user.points += 10;

      return user.save();
    },
    createPoll: async (root, { options }) => {
      const poll = new Poll({
        options,
        votes: options.map((optionId) => ({ optionId, count: 0 })),
      });

      return poll.save();
    },
    castVote: async (root, { pollId, optionId }, context) => {
      const poll = await Poll.findById(pollId);

      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("No user found");
      }

      if (!poll) {
        throw new GraphQLError("Poll not found");
      }

      const voteEntry = poll.votes.find(
        (vote) => vote.optionId.toString() === optionId
      );

      if (voteEntry) {
        voteEntry.count += 1;
      } else {
        poll.votes.push({ optionId, count: 1 });
      }

      await poll.save();
      return Poll.findById(pollId).populate("options");
    },
    addEnrolledUser: async (root, { name }) => {
      if (!name) {
        throw new GraphQLError("Username for the enrolled user must be given");
      }
      const userExists = await Enrolled.findOne({ name });

      if (userExists) {
        throw new GraphQLError("User is already in list");
      }

      const enrolled = new Enrolled({ name });

      return enrolled.save();
    },
  },
  User: {
    id: (root) => root._id.toString(),
    progress: async (root) => {
      const populatedUser = await User.findById(root._id)
        .populate({
          path: "progress.roadmap",
          populate: {
            path: "sections",
          },
        })
        .populate("progress.completedSections");
      return populatedUser.progress;
    },
  },
  Roadmap: {
    id: (root) => root._id.toString(),
  },
  Section: {
    id: (root) => root._id.toString(),
  },
  Poll: {
    options: async (root) => {
      return Upcoming.find({ _id: { $in: root.options } });
    },
  },
};

module.exports = resolvers;
