export type DsaStep = {
  state: string;
  operation: string;
  variables: string;
  callStack: string;
};

export type DsaAlgorithm = {
  label: string;
  time: string;
  space: string;
  steps: DsaStep[];
};

const trace = (
  label: string,
  time: string,
  space: string,
  states: string[],
  operations: string[],
  variables: string[],
  callStack: string[] = [],
): DsaAlgorithm => ({
  label,
  time,
  space,
  steps: states.map((state, index) => ({
    state,
    operation: operations[index],
    variables: variables[index],
    callStack: callStack[index] ?? "main()",
  })),
});

export const dsaAlgorithms = {
  arrays: trace(
    "Arrays",
    "O(n)",
    "O(1)",
    ["[7, 2, 5, 1]", "[7, 2, 5, 1]", "[7, 2, 5, 1]", "value = 5"],
    ["Start linear scan", "Check index 0", "Check index 1", "Read index 2"],
    ["target=5, i=0", "7 ≠ 5, i=0", "2 ≠ 5, i=1", "5 = 5, i=2"],
  ),
  "linked-list": trace(
    "Linked lists",
    "O(n)",
    "O(1)",
    ["head → 4 → 8 → 12 → null", "4 → 8 → 12", "4 → 8 → 12", "4 → 8 → 10 → 12"],
    ["Start at head", "Follow next pointer", "Find insertion point", "Link the new node"],
    ["current=4", "current=8", "previous=8, current=12", "new=10, new.next=12"],
  ),
  stack: trace(
    "Stacks",
    "O(1) per operation",
    "O(n)",
    ["[]", "[A]", "[A, B]", "[A]"],
    ["Create stack", "Push A", "Push B", "Pop B"],
    ["top=none", "top=A", "top=B", "value=B, top=A"],
  ),
  queue: trace(
    "Queues",
    "O(1) per operation",
    "O(n)",
    ["front [] back", "front [A] back", "front [A, B] back", "front [B] back"],
    ["Create queue", "Enqueue A", "Enqueue B", "Dequeue A"],
    ["head=0, tail=0", "head=0, tail=1", "head=0, tail=2", "value=A, head=1"],
  ),
  "hash-map": trace(
    "Hash maps",
    "Average O(1)",
    "O(n)",
    ["{}", "{ ada: 92 }", "bucket 3: ada", "score = 92"],
    ["Create map", "Set ada", "Hash key ada", "Read matching bucket"],
    ["size=0", "key=ada, value=92", "hash(ada)=3", "result=92"],
  ),
  tree: trace(
    "Trees",
    "O(n)",
    "O(h)",
    ["    8\n   / \\\n  4  12", "visit 8", "visit 4", "visit 12", "order: 4, 8, 12"],
    ["Start in-order traversal", "Descend left", "Return and record 4", "Record 8 then visit right", "Traversal complete"],
    ["node=8", "node=4", "result=[4]", "result=[4,8,12]", "count=3"],
    ["walk(8)", "walk(8) → walk(4)", "walk(8)", "walk(8) → walk(12)", "main()"],
  ),
  graph: trace(
    "Graphs",
    "O(V + E)",
    "O(V)",
    ["A:{B,C} B:{D} C:{D}", "visited={A}", "visited={A,B}", "visited={A,B,C}", "visited={A,B,C,D}"],
    ["Create adjacency list", "Visit A", "Follow A→B", "Follow A→C", "Reach D once"],
    ["node=A", "frontier=[B,C]", "frontier=[C,D]", "frontier=[D]", "frontier=[]"],
  ),
  sorting: trace(
    "Sorting",
    "O(n²) bubble sort",
    "O(1)",
    ["[7, 2, 5, 1]", "[2, 7, 5, 1]", "[2, 5, 7, 1]", "[2, 5, 1, 7]", "[1, 2, 5, 7]"],
    ["Start first pass", "Swap 7 and 2", "Swap 7 and 5", "Swap 7 and 1", "Finish remaining passes"],
    ["i=0, j=0", "j=1", "j=2", "end=3", "sorted=true"],
  ),
  "binary-search": trace(
    "Binary search",
    "O(log n)",
    "O(1)",
    ["[2,5,8,14,17,23,29,31]", "mid 3 → 14", "range 4…7", "mid 5 → 23", "found index 5"],
    ["Set search range", "Compare midpoint", "Discard left half", "Compare midpoint", "Return index"],
    ["low=0, high=7", "mid=3, target=23", "low=4, high=7", "mid=5", "result=5"],
  ),
  recursion: trace(
    "Recursion",
    "O(n)",
    "O(n) call stack",
    ["factorial(4)", "4 × factorial(3)", "3 × factorial(2)", "factorial(1) = 1", "unwind → 24"],
    ["Call with 4", "Call with 3", "Call with 2", "Reach base case", "Return through every frame"],
    ["n=4", "n=3", "n=2", "n=1", "result=24"],
    ["factorial(4)", "factorial(4) → factorial(3)", "factorial(4) → factorial(3) → factorial(2)", "factorial(4) → factorial(3) → factorial(2) → factorial(1)", "main()"],
  ),
  bfs: trace(
    "Breadth-first search",
    "O(V + E)",
    "O(V)",
    ["queue=[A]", "visit A; queue=[B,C]", "visit B; queue=[C,D]", "visit C; queue=[D,E]", "order=A,B,C,D,E"],
    ["Seed queue", "Dequeue A", "Dequeue B", "Dequeue C", "Finish level order"],
    ["visited={}", "visited={A}", "visited={A,B}", "visited={A,B,C}", "visited={A,B,C,D,E}"],
  ),
  dfs: trace(
    "Depth-first search",
    "O(V + E)",
    "O(V)",
    ["stack=[A]", "visit A; stack=[C,B]", "visit B; stack=[C,D]", "visit D; stack=[C]", "order=A,B,D,C"],
    ["Seed stack", "Pop A", "Pop B", "Pop D", "Finish depth-first order"],
    ["visited={}", "visited={A}", "visited={A,B}", "visited={A,B,D}", "visited={A,B,C,D}"],
    ["dfs(A)", "dfs(A) → dfs(B)", "dfs(A) → dfs(B) → dfs(D)", "dfs(A)", "main()"],
  ),
  "dynamic-programming": trace(
    "Dynamic programming",
    "O(n)",
    "O(n)",
    ["ways=[1,1,_,_,_]", "ways=[1,1,2,_,_]", "ways=[1,1,2,3,_]", "ways=[1,1,2,3,5]"],
    ["Seed base cases", "Reuse ways[0] + ways[1]", "Reuse ways[1] + ways[2]", "Reuse ways[2] + ways[3]"],
    ["i=1", "i=2, ways[2]=2", "i=3, ways[3]=3", "i=4, result=5"],
  ),
} satisfies Record<string, DsaAlgorithm>;

export type DsaAlgorithmId = keyof typeof dsaAlgorithms;
