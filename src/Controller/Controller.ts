import { Pawn } from "../Core/Pawn";
import { IUpdatable } from "../Interface/IUpdatable";
import { HitscanResult } from "../Interface/utils";

/**
 * An advanced, generic controller for a pawn.
 *
 * This abstract class provides a more flexible and type-safe foundation
 * for creating controllers for various types of pawns. By using generics,
 * we can create controllers for specific pawn subclasses, and the compiler
 * will enforce type safety.
 *
 * @template T The type of the pawn to be controlled. Must extend Pawn.
 */
export abstract class Controller<T extends Pawn> implements IUpdatable {
    /**
     * The pawn being controlled.
     * It's marked as `readonly` to prevent it from being changed after the controller is initialized.
     * This is a good practice for dependency injection.
     */
    protected readonly controlledPawn: T;

    constructor(controlledPawn: T) {
        this.controlledPawn = controlledPawn;
    }

    /**
     * Updates the controller's state.
     * @param dt The delta time since the last update, in seconds.
     */
    abstract update(dt: number): void;

    /**
     * Moves the pawn forward.
     * @param speed The speed at which to move.
     * @param dt The delta time since the last update, in seconds.
     */
    abstract moveForward(speed: number, dt: number): void;

    /**
     * Moves the pawn backward.
     * @param speed The speed at which to move.
     * @param dt The delta time since the last update, in seconds.
     */
    abstract moveBackward(speed: number, dt: number): void;

    /**
     * Moves the pawn left.
     * @param speed The speed at which to move.
     * @param dt The delta time since the last update, in seconds.
     */
    abstract moveLeft(speed: number, dt: number): void;

    /**
     * Moves the pawn right.
     * @param speed The speed at which to move.
     * @param dt The delta time since the last update, in seconds.
     */
    abstract moveRight(speed: number, dt: number): void;

    /**
     * Makes the pawn shoot.
     * @returns A HitscanResult if the shot hits something, otherwise undefined.
     */
    abstract shoot(): HitscanResult | undefined;

    /**
     * Makes the pawn jump.
     * @returns True if the jump was successful, otherwise false.
     */
    abstract jump(): boolean;
}
