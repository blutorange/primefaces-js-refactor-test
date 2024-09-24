export interface BaseWidgetCfg {
    id: string;
}
export interface DeferredWidgetCfg extends BaseWidgetCfg {
    minimumDelay?: number;
}
