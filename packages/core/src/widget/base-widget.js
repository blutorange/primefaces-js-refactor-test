export class BaseWidget {
    constructor() {
        this.name = 'BaseWidget';
    }
    
    render() {
        return `<div>${this.name}</div>`;
    }
}