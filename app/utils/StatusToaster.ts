const toast = useToast();

export class StatusToaster {
  context: string | null;

  constructor(context: string | null = null) {
    this.context = context;
  }

  success(operation: string, details: string = ''): void {
    toast.add({
      title: `${operation}${this.context ? ' (' + this.context + ')' : ''}`,
      description: details,
      icon: icons.success,
      color: 'success',
      duration: 5000,
    });
  }

  error(message: string, details: string = ''): void {
    toast.add({
      title: `${message}${this.context ? ' (' + this.context + ')' : ''}`,
      description: details,
      icon: icons.error,
      color: 'error',
      duration: -1,
    });
  }

  updateContext(context: string): void {
    this.context = context;
  }
}
