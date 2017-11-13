////////////////////////////////////////////////////////////////////////////////
// Lantern
//
// Describes how the lantern behaves and how fuel affects its properties
////////////////////////////////////////////////////////////////////////////////
export class Lantern {

    constructor(amount: number = 100, loss_per_tick: number = 1.5) {
        this.fuel = amount;
        this.loss_per_tick = loss_per_tick;
    }

    fuel : number;

    // How much fuel is expended per tick
    loss_per_tick : number;

    addFuel(added_fuel: number = 75) {
        this.fuel += added_fuel;
        console.log("Fuel now at " + this.fuel);

    }

    // This occurs once per tick, the amount expended is always the same
    expendFuel() {
        this.fuel = Math.max(this.fuel - this.loss_per_tick, 0.0);
        console.log("Fuel now at " + this.fuel);
    }
}
