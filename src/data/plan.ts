export type Difficulty = "Easy" | "Medium" | "Hard";
export type Platform = "LeetCode" | "HackerRank";

export interface Problem {
  id: string; // unique slug used in URL
  day: number;
  title: string;
  platform: Platform;
  platformId?: string;
  difficulty: Difficulty;
  topic: string;
  strategy: string;
  timeComplexity: string;
  spaceComplexity: string;
  url?: string;
}

export interface DayPlan {
  day: number;
  title: string;
  focus: string;
}

export const DAYS: DayPlan[] = [
  { day: 1, title: "Two Pointers & Sliding Window", focus: "Move pointers from ends or window across arrays/strings." },
  { day: 2, title: "Arrays & Hashing", focus: "Use hash maps/sets to trade space for O(1) lookups." },
  { day: 3, title: "Stack & Monotonic Stack", focus: "LIFO patterns, parentheses, next-greater-element." },
  { day: 4, title: "Linked Lists", focus: "Pointers, fast/slow, reversal, dummy nodes." },
  { day: 5, title: "Binary Search", focus: "Search on sorted data and on the answer." },
  { day: 6, title: "Trees - BFS & DFS", focus: "Recursion + level-order traversal." },
  { day: 7, title: "BST & Tries", focus: "Ordered tree properties and prefix trees." },
  { day: 8, title: "Mock Assessment 1", focus: "Mixed timed problems. Plan first, code second." },
  { day: 9, title: "Heap / Priority Queue", focus: "Top-K, scheduling, merging streams." },
  { day: 10, title: "Graphs - BFS & DFS", focus: "Grids, adjacency lists, cycles, topo sort." },
  { day: 11, title: "Dynamic Programming 1D", focus: "Subproblems on indices. Recurrence + memo/tabulate." },
  { day: 12, title: "Dynamic Programming 2D", focus: "Two-index DP: strings, grids, knapsack." },
  { day: 13, title: "Greedy, Intervals & Backtracking", focus: "Local choice, sweep lines, recursive exploration." },
  { day: 14, title: "Mock Assessment 2", focus: "Final mixed set across all 13 topics." },
];

const P = (
  day: number,
  platformId: string,
  title: string,
  platform: Platform,
  difficulty: Difficulty,
  topic: string,
  strategy: string,
  tc: string,
  sc: string,
  url?: string,
): Problem => ({
  id: `d${day}-${platformId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  day,
  platformId,
  title,
  platform,
  difficulty,
  topic,
  strategy,
  timeComplexity: tc,
  spaceComplexity: sc,
  url,
});

export const PROBLEMS: Problem[] = [
  // Day 1 — Two Pointers & Sliding Window
  P(1, "LC167", "Two Sum II - Input Array Is Sorted", "LeetCode", "Easy", "Two Pointers", "Converging pointers", "O(n)", "O(1)"),
  P(1, "LC26", "Remove Duplicates from Sorted Array", "LeetCode", "Easy", "Two Pointers", "Slow/fast write pointer", "O(n)", "O(1)"),
  P(1, "LC11", "Container With Most Water", "LeetCode", "Medium", "Two Pointers", "Shrink from taller side", "O(n)", "O(1)"),
  P(1, "LC15", "3Sum", "LeetCode", "Medium", "Two Pointers", "Sort + fix one + two-pointer", "O(n^2)", "O(1)"),
  P(1, "LC3", "Longest Substring Without Repeating Characters", "LeetCode", "Medium", "Sliding Window", "Expand right, shrink left on dup", "O(n)", "O(k)"),
  P(1, "LC209", "Minimum Size Subarray Sum", "LeetCode", "Medium", "Sliding Window", "Variable window on sum", "O(n)", "O(1)"),
  P(1, "LC76", "Minimum Window Substring", "LeetCode", "Hard", "Sliding Window", "Counts + need/have", "O(n)", "O(k)"),

  // Day 2 — Arrays & Hashing
  P(2, "LC1", "Two Sum", "LeetCode", "Easy", "Hash Map", "complement lookup", "O(n)", "O(n)"),
  P(2, "LC217", "Contains Duplicate", "LeetCode", "Easy", "Hash Set", "seen set", "O(n)", "O(n)"),
  P(2, "LC242", "Valid Anagram", "LeetCode", "Easy", "Hash Map", "char count compare", "O(n)", "O(1)"),
  P(2, "LC49", "Group Anagrams", "LeetCode", "Medium", "Hash Map", "sorted key bucket", "O(n*k log k)", "O(nk)"),
  P(2, "LC347", "Top K Frequent Elements", "LeetCode", "Medium", "Hash + Bucket", "bucket sort by freq", "O(n)", "O(n)"),
  P(2, "LC238", "Product of Array Except Self", "LeetCode", "Medium", "Prefix/Suffix", "L*R products", "O(n)", "O(1)"),
  P(2, "LC128", "Longest Consecutive Sequence", "LeetCode", "Medium", "Hash Set", "start-of-run check", "O(n)", "O(n)"),

  // Day 3 — Stack & Monotonic Stack
  P(3, "LC20", "Valid Parentheses", "LeetCode", "Easy", "Stack", "match pairs on pop", "O(n)", "O(n)"),
  P(3, "LC155", "Min Stack", "LeetCode", "Medium", "Stack", "aux min stack", "O(1)", "O(n)"),
  P(3, "LC150", "Evaluate Reverse Polish Notation", "LeetCode", "Medium", "Stack", "operand stack", "O(n)", "O(n)"),
  P(3, "LC22", "Generate Parentheses", "LeetCode", "Medium", "Stack/Backtrack", "open<n, close<open", "O(4^n / sqrt n)", "O(n)"),
  P(3, "LC739", "Daily Temperatures", "LeetCode", "Medium", "Monotonic Stack", "decreasing stack of indices", "O(n)", "O(n)"),
  P(3, "LC84", "Largest Rectangle in Histogram", "LeetCode", "Hard", "Monotonic Stack", "stack of increasing heights", "O(n)", "O(n)"),

  // Day 4 — Linked Lists
  P(4, "LC206", "Reverse Linked List", "LeetCode", "Easy", "Linked List", "iterative prev/curr", "O(n)", "O(1)"),
  P(4, "LC21", "Merge Two Sorted Lists", "LeetCode", "Easy", "Linked List", "dummy head + merge", "O(n+m)", "O(1)"),
  P(4, "LC141", "Linked List Cycle", "LeetCode", "Easy", "Fast/Slow", "Floyd's cycle", "O(n)", "O(1)"),
  P(4, "LC143", "Reorder List", "LeetCode", "Medium", "Linked List", "mid+reverse+merge", "O(n)", "O(1)"),
  P(4, "LC19", "Remove Nth Node From End", "LeetCode", "Medium", "Two Pointers", "gap of n", "O(n)", "O(1)"),
  P(4, "LC138", "Copy List with Random Pointer", "LeetCode", "Medium", "Hash Map", "old->new map", "O(n)", "O(n)"),
  P(4, "LC25", "Reverse Nodes in k-Group", "LeetCode", "Hard", "Linked List", "reverse blocks", "O(n)", "O(1)"),

  // Day 5 — Binary Search
  P(5, "LC704", "Binary Search", "LeetCode", "Easy", "Binary Search", "classic lo/hi", "O(log n)", "O(1)"),
  P(5, "LC74", "Search a 2D Matrix", "LeetCode", "Medium", "Binary Search", "treat as 1D", "O(log mn)", "O(1)"),
  P(5, "LC875", "Koko Eating Bananas", "LeetCode", "Medium", "Search on Answer", "feasibility check", "O(n log m)", "O(1)"),
  P(5, "LC33", "Search in Rotated Sorted Array", "LeetCode", "Medium", "Binary Search", "find sorted half", "O(log n)", "O(1)"),
  P(5, "LC153", "Find Minimum in Rotated Sorted Array", "LeetCode", "Medium", "Binary Search", "compare mid vs hi", "O(log n)", "O(1)"),
  P(5, "LC4", "Median of Two Sorted Arrays", "LeetCode", "Hard", "Binary Search", "partition both", "O(log min(n,m))", "O(1)"),

  // Day 6 — Trees BFS/DFS
  P(6, "LC226", "Invert Binary Tree", "LeetCode", "Easy", "Tree DFS", "swap children recursively", "O(n)", "O(h)"),
  P(6, "LC104", "Maximum Depth of Binary Tree", "LeetCode", "Easy", "Tree DFS", "1+max(l,r)", "O(n)", "O(h)"),
  P(6, "LC100", "Same Tree", "LeetCode", "Easy", "Tree DFS", "structural recursion", "O(n)", "O(h)"),
  P(6, "LC543", "Diameter of Binary Tree", "LeetCode", "Easy", "Tree DFS", "post-order height + best", "O(n)", "O(h)"),
  P(6, "LC110", "Balanced Binary Tree", "LeetCode", "Easy", "Tree DFS", "height + balance check", "O(n)", "O(h)"),
  P(6, "LC102", "Binary Tree Level Order Traversal", "LeetCode", "Medium", "Tree BFS", "queue by level", "O(n)", "O(n)"),
  P(6, "LC199", "Binary Tree Right Side View", "LeetCode", "Medium", "Tree BFS", "last node per level", "O(n)", "O(n)"),
  P(6, "LC124", "Binary Tree Maximum Path Sum", "LeetCode", "Hard", "Tree DFS", "gain vs through", "O(n)", "O(h)"),

  // Day 7 — BST & Tries
  P(7, "LC98", "Validate Binary Search Tree", "LeetCode", "Medium", "BST", "min/max bounds", "O(n)", "O(h)"),
  P(7, "LC230", "Kth Smallest Element in a BST", "LeetCode", "Medium", "BST", "in-order count", "O(h+k)", "O(h)"),
  P(7, "LC235", "Lowest Common Ancestor of BST", "LeetCode", "Medium", "BST", "split point", "O(h)", "O(1)"),
  P(7, "LC208", "Implement Trie (Prefix Tree)", "LeetCode", "Medium", "Trie", "children map per node", "O(L)", "O(L*N)"),
  P(7, "LC211", "Design Add and Search Words", "LeetCode", "Medium", "Trie", "DFS for '.' wildcard", "O(L * 26^.)", "O(L*N)"),
  P(7, "LC297", "Serialize and Deserialize Binary Tree", "LeetCode", "Hard", "Tree BFS/DFS", "pre-order with nulls", "O(n)", "O(n)"),

  // Day 8 — Mock 1
  P(8, "HR-DD", "Diagonal Difference", "HackerRank", "Easy", "Arrays", "warmup loop", "O(n)", "O(1)"),
  P(8, "LC53", "Maximum Subarray", "LeetCode", "Medium", "DP / Kadane", "running max sum", "O(n)", "O(1)"),
  P(8, "LC200", "Number of Islands", "LeetCode", "Medium", "Graph DFS", "flood fill", "O(mn)", "O(mn)"),
  P(8, "LC295", "Find Median from Data Stream", "LeetCode", "Hard", "Two Heaps", "max-heap + min-heap", "O(log n)", "O(n)"),

  // Day 9 — Heap / PQ
  P(9, "LC703", "Kth Largest Element in a Stream", "LeetCode", "Easy", "Heap", "min-heap size k", "O(log k)", "O(k)"),
  P(9, "LC1046", "Last Stone Weight", "LeetCode", "Easy", "Heap", "max-heap simulate", "O(n log n)", "O(n)"),
  P(9, "LC973", "K Closest Points to Origin", "LeetCode", "Medium", "Heap", "max-heap of size k", "O(n log k)", "O(k)"),
  P(9, "LC215", "Kth Largest Element in an Array", "LeetCode", "Medium", "Heap / Quickselect", "min-heap or partition", "O(n) avg", "O(1)"),
  P(9, "LC621", "Task Scheduler", "LeetCode", "Medium", "Heap / Greedy", "max-heap with cooldown", "O(n log 26)", "O(1)"),
  P(9, "LC23", "Merge k Sorted Lists", "LeetCode", "Hard", "Heap", "min-heap of heads", "O(n log k)", "O(k)"),

  // Day 10 — Graphs
  P(10, "LC695", "Max Area of Island", "LeetCode", "Medium", "Graph DFS", "flood + size", "O(mn)", "O(mn)"),
  P(10, "LC133", "Clone Graph", "LeetCode", "Medium", "Graph DFS", "old->new map", "O(V+E)", "O(V)"),
  P(10, "LC207", "Course Schedule", "LeetCode", "Medium", "Topo Sort", "DFS cycle / Kahn", "O(V+E)", "O(V+E)"),
  P(10, "LC417", "Pacific Atlantic Water Flow", "LeetCode", "Medium", "Graph BFS", "DFS from each ocean", "O(mn)", "O(mn)"),
  P(10, "LC994", "Rotting Oranges", "LeetCode", "Medium", "Graph BFS", "multi-source BFS", "O(mn)", "O(mn)"),
  P(10, "LC130", "Surrounded Regions", "LeetCode", "Medium", "Graph DFS", "border seed flood", "O(mn)", "O(mn)"),
  P(10, "LC127", "Word Ladder", "LeetCode", "Hard", "Graph BFS", "BFS over patterns", "O(L^2 * n)", "O(L^2 * n)"),

  // Day 11 — DP 1D
  P(11, "LC70", "Climbing Stairs", "LeetCode", "Easy", "DP 1D", "fib-like dp[i]=dp[i-1]+dp[i-2]", "O(n)", "O(1)"),
  P(11, "LC198", "House Robber", "LeetCode", "Medium", "DP 1D", "max(skip, take+prev2)", "O(n)", "O(1)"),
  P(11, "LC213", "House Robber II", "LeetCode", "Medium", "DP 1D", "two passes (circular)", "O(n)", "O(1)"),
  P(11, "LC322", "Coin Change", "LeetCode", "Medium", "DP 1D", "unbounded knapsack", "O(n*amount)", "O(amount)"),
  P(11, "LC300", "Longest Increasing Subsequence", "LeetCode", "Medium", "DP / Patience", "tails binary search", "O(n log n)", "O(n)"),
  P(11, "LC152", "Maximum Product Subarray", "LeetCode", "Medium", "DP", "track min & max", "O(n)", "O(1)"),
  P(11, "LC139", "Word Break", "LeetCode", "Medium", "DP 1D", "dp[i] if any cut works", "O(n^2)", "O(n)"),

  // Day 12 — DP 2D
  P(12, "LC62", "Unique Paths", "LeetCode", "Medium", "DP 2D", "grid[i][j]=up+left", "O(mn)", "O(n)"),
  P(12, "LC1143", "Longest Common Subsequence", "LeetCode", "Medium", "DP 2D", "match vs skip", "O(mn)", "O(mn)"),
  P(12, "LC309", "Best Time to Buy/Sell w/ Cooldown", "LeetCode", "Medium", "State DP", "3 states: hold/sold/rest", "O(n)", "O(1)"),
  P(12, "LC518", "Coin Change II", "LeetCode", "Medium", "DP 2D", "count combinations", "O(n*amount)", "O(amount)"),
  P(12, "LC72", "Edit Distance", "LeetCode", "Hard", "DP 2D", "insert/delete/replace", "O(mn)", "O(mn)"),
  P(12, "LC312", "Burst Balloons", "LeetCode", "Hard", "Interval DP", "last balloon to burst", "O(n^3)", "O(n^2)"),

  // Day 13 — Greedy / Intervals / Backtracking
  P(13, "LC55", "Jump Game", "LeetCode", "Medium", "Greedy", "track farthest reach", "O(n)", "O(1)"),
  P(13, "LC45", "Jump Game II", "LeetCode", "Medium", "Greedy / BFS", "expanding window", "O(n)", "O(1)"),
  P(13, "LC134", "Gas Station", "LeetCode", "Medium", "Greedy", "single pass reset", "O(n)", "O(1)"),
  P(13, "LC56", "Merge Intervals", "LeetCode", "Medium", "Intervals", "sort + merge overlap", "O(n log n)", "O(n)"),
  P(13, "LC435", "Non-overlapping Intervals", "LeetCode", "Medium", "Greedy / Intervals", "sort by end", "O(n log n)", "O(1)"),
  P(13, "LC78", "Subsets", "LeetCode", "Medium", "Backtracking", "include/exclude tree", "O(n*2^n)", "O(n)"),
  P(13, "LC46", "Permutations", "LeetCode", "Medium", "Backtracking", "swap or used-set", "O(n*n!)", "O(n)"),
  P(13, "LC51", "N-Queens", "LeetCode", "Hard", "Backtracking", "cols/diags constraints", "O(n!)", "O(n^2)"),

  // Day 14 — Mock 2
  P(14, "HR-SM", "Sock Merchant", "HackerRank", "Easy", "Hash", "count pairs", "O(n)", "O(n)"),
  P(14, "LC268", "Missing Number", "LeetCode", "Easy", "XOR / Math", "sum or xor", "O(n)", "O(1)"),
  P(14, "LC412", "Fizz Buzz", "LeetCode", "Easy", "Strings", "warmup conditional", "O(n)", "O(n)"),
  P(14, "LC5", "Longest Palindromic Substring", "LeetCode", "Medium", "Expand Around Center", "odd & even centers", "O(n^2)", "O(1)"),
  P(14, "LC79", "Word Search", "LeetCode", "Medium", "Backtracking", "DFS w/ visited mark", "O(mn*4^L)", "O(L)"),
  P(14, "LC287", "Find the Duplicate Number", "LeetCode", "Medium", "Fast/Slow", "Floyd on indices", "O(n)", "O(1)"),
  P(14, "LC41", "First Missing Positive", "LeetCode", "Hard", "Index Mapping", "place i at A[i]-1", "O(n)", "O(1)"),
];

export const TOTAL = PROBLEMS.length;

export function problemsByDay(day: number) {
  return PROBLEMS.filter((p) => p.day === day);
}

export function getProblem(id: string) {
  return PROBLEMS.find((p) => p.id === id);
}