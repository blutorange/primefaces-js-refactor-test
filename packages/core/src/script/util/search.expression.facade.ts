namespace PrimeFaces {
    export class SearchExpressionFacade {
        resolveComponentsAsSelector(source: JQuery, expressions: string): JQuery {
            return source;
        }
        resolveComponents(source: JQuery, expressions: string): string {
            return expressions;
        }
        splitExpressions(expressions: string): string {
            return expressions;
        }
    }
}
