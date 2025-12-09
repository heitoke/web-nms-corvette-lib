export type Mode = 'default' | 'fixed';

export interface Button {
    label: string;
    text?: string;
    icon?: string;

    click?(event: MouseEvent): void;
}

export interface NotificationTemplate {
    name: string;
    title: string;
    text: string;
    icon: string;
    image: string;
    color: string;
    buttons: Array<Button>;
    group: string;
    mode: Mode;
}

export interface Notification extends Partial<NotificationTemplate> {
    id: number;
    hidden: boolean;
    createdAt: number;

    remove(): void;
    hide(): void;
}

export interface Group {
    title: string;
    text?: string;
    icon: string;
    image: string;
    updatedAt: Date;
}