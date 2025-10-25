// Optional async jobs queue (stub)
export type Job<T = unknown> = { id: string; type: string; payload: T }

export class Queue {
  private items: Job[] = []

  enqueue(job: Job) {
    this.items.push(job)
  }

  dequeue(): Job | undefined {
    return this.items.shift()
  }
}
