export interface playerMoves {
    name: string;
    icon: string;
    movesArray: Queue<move>
}

export interface move {
    row: number;
    column: number;
}

export class Queue<T> {
    public items: move[] = [];
    private maxSize: number = 3; // Maximum size of the queue

    constructor(maxSize: number = 3) {
        this.maxSize = maxSize;
    }

    enqueue(item: move): void {
        if (this.items.length >= this.maxSize) {
           this.dequeue(); // Remove the oldest item if the queue is full
        }
         // Check if the item already exists in the queue
        this.items.push(item);
    }

    dequeue(): move | undefined {
        return this.items.shift();
    }

    peekFirst(): move {
        return this.items[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }


}
