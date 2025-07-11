export class Failure {
  constructor(public message: string) {}
}

export class ServerFailure extends Failure {
  constructor(message: string) {
    super(message || "Server Error");
  }
}

export class NetworkFailure extends Failure {
  constructor(message: string) {
    super(message || "Network connection failed");
  }
}
