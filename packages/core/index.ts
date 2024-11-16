import { clientwindow, type ClientWindow } from "./src/util/clientwindow.js";
import { SearchExpressionFacade } from "./src/util/search.expression.facade.js";
import { BaseWidget} from "./src/widget/BaseWidget.js"
import { DeferredWidget } from "./src/widget/DeferredWidget.js"

declare global {
    namespace PrimeType {
        export interface WidgetRegistry {
            BaseWidget: typeof BaseWidget;
            DeferredWidget: typeof DeferredWidget;
        }
        export interface PrimeFaces {
            clientwindow: ClientWindow;
            SearchExpressionFacade: typeof SearchExpressionFacade;
        }
    }
    namespace PrimeType.widget {
        export type BaseWidgetCfg = import("./src/widget/BaseWidget.js").BaseWidgetCfg;
        export type DeferredWidgetCfg = import("./src/widget/DeferredWidget.js").DeferredWidgetCfg;
    }
}

// @ts-expect-errors
(window.PrimeFaces ??= {}).widget ??= {};

PrimeFaces.widget.BaseWidget = BaseWidget;
PrimeFaces.widget.DeferredWidget = DeferredWidget;
PrimeFaces.clientwindow = clientwindow;
PrimeFaces.SearchExpressionFacade = SearchExpressionFacade;