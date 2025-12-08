export interface SaveTopLevel {
    Version: number;
    Platform: string;
    ActiveContext: 'Main' | 'Expedition';
    CommonStateData: CommonStateData;
    BaseContext: StateData;
    ExpeditionContext?: StateData;
    DiscoveryManagerData: DiscoveryManagerData;
}

interface StateData {
    GameMode: number;
    PlayerStateData: PlayerStateData;
    SpawnStateData: SpawnStateData;
}

interface CommonStateData {
    SaveName: string;
    TotalPlayTime: number;
}

interface DiscoveryManagerData {
    ReserveStore: number;
    ReserveManaged: number;
    Store: {
        Record: object[];
    };
    Available: object[];
    Enqueued: object[];
}

interface SpawnStateData {
    LastKnownPlayerState:
        | 'OnFoot'
        | 'InShip'
        | 'InStation'
        | 'AboardFleet'
        | 'InNexus'
        | 'AbandonedFreighter'
        | 'InShipLanded';
}

export interface ShipOwnership {
    Name: string;
    Direction: [number, number, number, number];
    Inventory: any;
    InventoryLayout: any;
    Inventory_Cargo: any;
    Inventory_TechOnly: any;
    Location: 0;
    Position: [number, number, number, number];
    Resource: {
        AltId: string;
        Filename: string;
        ProceduralTexture: {
            Samplers: Array<any>;
        }
        Seed: [boolean, string];
    }
}

export interface PersistentPlayerBase {
    AutoPowerSettings: {
        BaseAutoPowerSetting: 'UseDefault';
    };
    BaseType: {
        PersistentBaseTypes: 'PlayerShipBase' | 'HomePlanetBase' | 'FreighterBase';
    };
    BaseVersion: number;
    Difficulty: {
        DifficultyPreset: {
            DifficultyPresetType: 'Normal';
        }
    };
    Forward: [number, number, number];
    GalacticAddress: number | string;
    GameMode: {
        PresetGameMode: 'Normal';
    };
    IsFeatured: boolean;
    IsReported: boolean;
    LastEditedById: string;
    LastEditedByUsername: string;
    LastUpdateTimestamp: number;
    Name: string;
    Objects: Array<{
        At: [number, number, number];
        ObjectID: string;
        Position: [number, number, number];
        Timestamp: number;
        Up: [number, number, number];
        UserData: number;
    }>;
    OriginalBaseVersion: number;
    Owner: {
        LID: string;
        PTK: string;
        TS: number;
        UID: string;
        USN: string;
    };
    PlatformToken: string;
    Position: [number, number, number];
    RID: string;
    ScreenshotAt: [number, number, number];
    ScreenshotPos: [number, number, number];
    UserData: number;
}

export interface PlayerStateData {
    UniverseAddress: object;
    SaveSummary: string;
    DifficultyState: DifficultyState;
    TimeStamp: number;
    Inventory: Inventory<'Substance' | 'Product'>;
    Inventory_TechOnly: Inventory<'Technology'>;
    Health: number;
    ShipHealth: number;
    Shield: number;
    ShipShield: number;
    Energy: number;
    Units: number;
    Nanites: number;
    Specials: number;
    TimeAlive: number;
    Stats: object[];
    ShipOwnership: Array<ShipOwnership>;
    PersistentPlayerBases: Array<PersistentPlayerBase>;
}

interface DifficultyPresetType {
    DifficultyPresetType: 'Custom' | 'Normal' | 'Creative' | 'Relaxed' | 'Survival' | 'Permadeath';
}

interface DifficultyState {
    Preset: DifficultyPresetType;
    EasiestUsedPreset: DifficultyPresetType;
    HardestUsedPreset: DifficultyPresetType;
    Settings: { SettingsLocked: boolean };
}

export interface Inventory<T> {
    Slots: {
        Type: {
        InventoryType: T;
        };
        Id: string;
        Amount: number;
        MaxAmount: number;
        DamageFactor: number;
        FullyInstalled: boolean;
        Index: SlotIndex;
    }[];
    ValidSlotIndices: SlotIndex[];
    SpecialSlots?: SpecialSlot[];
    Width: number;
    Height: number;
}

interface SlotIndex {
    X: number;
    Y: number;
}

export interface SpecialSlot {
    Type: {
        InventorySpecialSlotType: 'Broken' | 'TechOnly' | 'Cargo' | 'BlockedByBrokenTech' | 'TechBonus';
    };
    Index: SlotIndex;
}