import gql from "graphql-tag";

export const GET_NODES = gql`
  query {
    queryReactFlowElement {
      id
      data
      position
    }
  }
`;

export const ADD_NODE = gql`
  mutation addReactFlowElement($ReactFlowElement: [AddTaskInput!]!) {
    ReactFlowElement(input: $ReactFlowElement) {
      ReactFlowElement {
        id
        data
        position
      }
    }
  }
`;

// export const TOGGLE_TODO = gql`
//   mutation updateTask($taskID: ID!, $completed: Boolean!) {
//     updateTask(input: {
//       filter: { id: [$taskID] },
//       set: {
//         completed: $completed
//       }
//     }) {
//       task {
//         id
//         title
//         completed
//       }
//     }
//   }
// `;

export const TOGGLE_ALL_TODO = gql`
  mutation updateTask($completed: Boolean!) {
    updateTask(input: {
      filter: {},
      set: {
        completed: $completed
      }
    }) {
      task {
        id
        title
        completed
      }
    }
  }
`;

export const DELETE_TODO = gql`
  mutation deleteTask($taskID: [ID!]) {
    deleteTask(filter: { id: $taskID }) {
      msg
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation updateTask($taskID: ID!, $task: TaskPatch!) {
    updateTask(input: {
      filter: { id: [$taskID] },
      set: $task
    }) {
      task {
        id
        title
        completed
      }
    }
  }
`;

export const CLEAR_COMPLETED_TODO = gql`
  mutation updateTask($completed: Boolean) {
    deleteTask(filter: { completed: $completed }) {
      msg
    }
  }
`;