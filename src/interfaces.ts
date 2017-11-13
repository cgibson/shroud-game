import {Player} from "./player";

export abstract class AbstractGame {
    abstract preload(): void;
    abstract create(): void;
    abstract render(): void;
    abstract update(): void;

    abstract getMap(): Phaser.Tilemap;
    abstract getPlayer(): Player;
    abstract getGame(): Phaser.Game;

    private static singleton_: AbstractGame = null;
    static Create<T extends AbstractGame>(ctor: new () => T) {
        if (AbstractGame.singleton_ == null) {
            AbstractGame.singleton_ = new ctor();
        } else {
            console.log("Another instance already exists?")
        }
        return AbstractGame.singleton_;
    }

    static GetInstance() {
        return AbstractGame.singleton_;
    }
}