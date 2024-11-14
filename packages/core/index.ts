// package: core.js

import { BaseWidget, type BaseWidgetCfg as _BaseWidgetCfg } from "./src/widget/BaseWidget.js";
import { DeferredWidget, type DeferredWidgetCfg as _DeferredWidgetCfg } from "./src/widget/DeferredWidget.js";
import { SearchExpressionFacade } from "./src/util/search.expression.facade.js";
import { ClientWindow } from "./src/util/clientwindow.js";

declare global {
    interface PrimeFaces {
        SearchExpressionFacade: SearchExpressionFacade;
        clientwindow: ClientWindow;
    }
    namespace PrimeType.widget {
        export type BaseWidgetCfg = _BaseWidgetCfg;
        export type DeferredWidgetCfg = _DeferredWidgetCfg;
        export interface WidgetRegistry {
            BaseWidget: typeof BaseWidget;
            DeferredWidget: typeof DeferredWidget;
        }
    }
}

// @ts-expect-error
(window.PrimeFaces ??= {}).widget ??= {};
PrimeFaces.widget.BaseWidget ??= BaseWidget;
PrimeFaces.widget.DeferredWidget ??= DeferredWidget;

PrimeFaces.SearchExpressionFacade ??= new SearchExpressionFacade();
PrimeFaces.clientwindow ??= new ClientWindow();
