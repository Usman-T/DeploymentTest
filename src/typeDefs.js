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

type Section {
  title: String
  content: String
  images: [String]
  description: String
  id: ID!
}

type Roadmap {
  title: String!
  description: String!
  image: String!
  sections: [Section]!
  draft: Boolean!
  id: ID!
}

type Upcoming {
  title: String!
  description: String!
  image: String!
  id: ID!
}

type Token {
  value: String!
}

type Query {
  me: User
  allUsers: [User]
  allRoadmaps(includeDrafts: Boolean): [Roadmap]
  allUpcomingRoadmaps: [Upcoming]
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
}

input SectionInput {
  title: String!
  content: String!
  description: String!
  images: [String]!
}
`;

module.exports = typeDefs;