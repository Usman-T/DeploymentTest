const typeDefs = `
type User {
  username: String!
  isAdmin: Boolean!
  points: Int!
  progress: [Progress]
  id: ID!
}

type Progress {
  roadmap: Roadmap
  completedSections: [Section]
}

type Module {
  title: String
  content: String # Markdown content
}
  
type Section {
  title: String!
  description: String! # Markdown content
  learningObjectives: String # Markdown content
  modules: [Module]
  images: [String]
  id: ID!
}

type Roadmap {
  title: String!
  description: String! # Markdown content
  image: String!
  sections: [Section]!
  draft: Boolean!
  id: ID!
}

type Upcoming {
  title: String!
  description: String! # Markdown content
  image: String!
  id: ID!
}

type Token {
  value: String!
}

type Vote {
  optionId: ID!
  count: Int!
}

type Poll {
  id: ID!
  options: [Upcoming!]!
  votes: [Vote!]!
}

type EnrolledUser {
  name: String!
  id: ID!
}

type Query {
  me: User
  allUsers: [User]
  allRoadmaps(includeDrafts: Boolean): [Roadmap]
  allUpcomingRoadmaps: [Upcoming]
  getPoll(id: ID!): Poll
  getAllPolls: [Poll!]!
  getAllEnrolledUsers: [EnrolledUser!]!
}

type Mutation {
  createUser(
    username: String!
    password: String!
    isAdmin: Boolean!
  ): User
  login(
    username: String!
    password: String!
  ): Token
  createRoadmap(
    title: String!
    description: String! 
    image: String!
    sections: [SectionInput!]!
    draft: Boolean
  ): Roadmap
  createUpcomingRoadmap(
    title: String!
    description: String! 
    image: String!
  ): Upcoming
  publishRoadmap(roadmapId: ID!): Roadmap
  enrollUser(roadmapId: ID!): User
  completeSection(
    roadmapId: ID!
    sectionId: ID!
  ): User
  createPoll(
    title: String!, 
    description: String, 
    options: [ID!]!): Poll!
  castVote(
    pollId: ID!,
    optionId: ID!): Poll!
  addEnrolledUser(
    name: String!
  ): EnrolledUser
}
  
input SectionInput {
  title: String!
  modules: [ModuleInput]
  learningObjectives: String 
  images: [String]
  description: String!
}

input ModuleInput {
  title: String
  content: String
}
`;

module.exports = typeDefs;
