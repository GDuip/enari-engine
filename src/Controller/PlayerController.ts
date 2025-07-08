import { Player } from "../Core/Player";
import { Vector3D } from "../Core/Vector"; // Assuming this exists for direction
import { HitscanResult } from "../Interface/utils";
import { Controller } from "./Controller";

// Represents the state of all relevant player inputs.
interface PlayerInputState {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
    shoot: boolean;
}

/**
 * A sophisticated controller that translates player keyboard/mouse input into pawn actions.
 *
 * This controller manages its own input state, decouples input events from game logic,
 * and handles movement in a unified, normalized way to prevent common issues like
 * faster diagonal movement.
 */
export class PlayerController extends Controller<Player> {
    // --- Properties ---
    public moveSpeed: number = 5.0; // Base movement speed
    public airControlModifier: number = 0.5; // Less control while in the air

    private inputState: PlayerInputState = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        shoot: false,
    };
    
    // Bind event handlers to 'this' instance to maintain context
    private readonly onKeyDownHandler: (e: KeyboardEvent) => void;
    private readonly onKeyUpHandler: (e: KeyboardEvent) => void;

    // --- Lifecycle Methods ---
    constructor(controlledPlayer: Player) {
        // Use the generic-ready super constructor
        super(controlledPlayer);

        // Bind handlers once to avoid context issues with event listeners
        this.onKeyDownHandler = this.onKeyDown.bind(this);
        this.onKeyUpHandler = this.onKeyUp.bind(this);
        
        this.startListening();
    }

    /**
     * The main update loop, called every frame.
     * It processes the current input state to move and act.
     * @param dt Delta time in seconds.
     */
    public update(dt: number): void {
        this.handleMovement(dt);
        this.handleActions();
    }

    /**
     * Cleans up the controller by removing event listeners.
     * Essential for preventing memory leaks when the player is destroyed.
     */
    public destroy(): void {
        this.stopListening();
    }
    
    // --- Abstract Method Implementations ---
    // Note: These are now primarily for compatibility with the abstract class
    // or for being called from external (e.g., UI) code. The main logic
    // is driven by the update loop and the internal inputState.

    public moveForward(): void { this.inputState.forward = true; }
    public moveBackward(): void { this.inputState.backward = true; }
    public moveLeft(): void { this.inputState.left = true; }
    public moveRight(): void { this.inputState.right = true; }

    public jump(): boolean {
        // No need for getPlayer(), this.controlledPawn is already a Player.
        if (this.controlledPawn.canJump()) {
            this.controlledPawn.jump();
            return true;
        }
        return false;
    }
    
    public shoot(): HitscanResult | undefined {
        if (this.controlledPawn.canShoot()) {
            return this.controlledPawn.shoot();
        }
        return undefined;
    }

    // --- Private Helper Methods ---

    /**
     * Calculates a final movement vector from the input state and commands the pawn.
     * @param dt Delta time in seconds.
     */
    private handleMovement(dt: number): void {
        const moveDirection = new Vector3D(0, 0, 0);

        if (this.inputState.forward) moveDirection.z += 1;
        if (this.inputState.backward) moveDirection.z -= 1;
        if (this.inputState.right) moveDirection.x += 1;
        if (this.inputState.left) moveDirection.x -= 1;
        
        // If there's movement input, process it
        if (moveDirection.x !== 0 || moveDirection.z !== 0) {
            // Normalize the vector to prevent faster diagonal movement
            moveDirection.normalize(); 

            const currentSpeed = this.controlledPawn.isOnGround()
                ? this.moveSpeed
                : this.moveSpeed * this.airControlModifier;
            
            // Command the pawn to move
            this.controlledPawn.move(moveDirection, currentSpeed, dt);
        }
    }

    /**
     * Handles single-press actions like jumping and shooting.
     */
    private handleActions(): void {
        if (this.inputState.jump) {
            this.jump();
        }
        if (this.inputState.shoot) {
            this.shoot();
            // Optional: for non-automatic weapons, reset the state
            // this.inputState.shoot = false;
        }
    }

    /**
     * Attaches key event listeners to the window.
     */
    private startListening(): void {
        window.addEventListener('keydown', this.onKeyDownHandler);
        window.addEventListener('keyup', this.onKeyUpHandler);
    }

    /**
     * Detaches key event listeners from the window.
     */
    private stopListening(): void {
        window.removeEventListener('keydown', this.onKeyDownHandler);
        window.removeEventListener('keyup', this.onKeyUpHandler);
    }

    private onKeyDown(event: KeyboardEvent): void {
        switch (event.code) {
            case 'KeyW': case 'ArrowUp': this.inputState.forward = true; break;
            case 'KeyS': case 'ArrowDown': this.inputState.backward = true; break;
            case 'KeyA': case 'ArrowLeft': this.inputState.left = true; break;
            case 'KeyD': case 'ArrowRight': this.inputState.right = true; break;
            case 'Space': this.inputState.jump = true; break;
            case 'Mouse0': case 'Enter': this.inputState.shoot = true; break; // Example
        }
    }

    private onKeyUp(event: KeyboardEvent): void {
        switch (event.code) {
            case 'KeyW': case 'ArrowUp': this.inputState.forward = false; break;
            case 'KeyS': case 'ArrowDown': this.inputState.backward = false; break;
            case 'KeyA': case 'ArrowLeft': this.inputState.left = false; break;
            case 'KeyD': case 'ArrowRight': this.inputState.right = false; break;
            case 'Space': this.inputState.jump = false; break;
            case 'Mouse0': case 'Enter': this.inputState.shoot = false; break; // Example
        }
    }
}
