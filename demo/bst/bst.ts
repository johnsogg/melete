// Clean BST implementation for educational use
// Extracted from demo for reusability

let nodeIdCounter = 0;

export class BSTNode {
  id: string;
  value: number;
  left: BSTNode | null = null;
  right: BSTNode | null = null;

  constructor(value: number) {
    this.id = `node-${nodeIdCounter++}`;
    this.value = value;
  }
}

export class BST {
  root: BSTNode | null = null;

  insert(value: number): boolean {
    if (this.search(value)) {
      return false; // Value already exists
    }

    if (!this.root) {
      this.root = new BSTNode(value);
      return true;
    }

    this.insertNode(this.root, value);
    return true;
  }

  private insertNode(node: BSTNode, value: number): BSTNode {
    if (value < node.value) {
      if (!node.left) {
        node.left = new BSTNode(value);
        return node.left;
      } else {
        return this.insertNode(node.left, value);
      }
    } else {
      if (!node.right) {
        node.right = new BSTNode(value);
        return node.right;
      } else {
        return this.insertNode(node.right, value);
      }
    }
  }

  search(value: number): boolean {
    return this.searchNode(this.root, value);
  }

  private searchNode(node: BSTNode | null, value: number): boolean {
    if (!node) return false;
    if (value === node.value) return true;
    if (value < node.value) return this.searchNode(node.left, value);
    return this.searchNode(node.right, value);
  }

  clear(): void {
    this.root = null;
  }

  // Get all nodes for iteration
  getAllNodes(): BSTNode[] {
    const nodes: BSTNode[] = [];
    this.traverseNodes(this.root, nodes);
    return nodes;
  }

  private traverseNodes(node: BSTNode | null, nodes: BSTNode[]): void {
    if (!node) return;
    nodes.push(node);
    this.traverseNodes(node.left, nodes);
    this.traverseNodes(node.right, nodes);
  }

  // Get tree depth for layout calculations
  getTreeDepth(node: BSTNode | null = this.root): number {
    if (!node) return 0;
    return (
      1 + Math.max(this.getTreeDepth(node.left), this.getTreeDepth(node.right))
    );
  }
}
