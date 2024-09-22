export class DeferredWidget {
    constructor() {
        this.name = 'DeferredWidget';
    }
    
    render() {
        return `<div>${this.name}</div>`;
    }

    _render() {
        return `<div>${this.name}</div>`;
    }
}