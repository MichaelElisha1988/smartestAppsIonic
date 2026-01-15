import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'measurements',
})
export class MeasurementsPipe implements PipeTransform {
  tmpValue: any = '';
  maxAmout: any = 10000;
  lastmeasurement: any = [];

  transform(
    value: string | null | undefined,
    topic: string,
    measureFrom: string | null | undefined,
    measurmentTo: string,
    Density: string
  ): any {
    if (!(topic && measureFrom && measurmentTo)) return null;
    if (measureFrom === measurmentTo) return value ? value : 1;
    let fixedNum = 2;
    switch (topic) {
      case 'Kitchen':
        switch (measureFrom) {
          case 'quart':
            switch (measurmentTo) {
              case 'teaspoons':
                this.tmpValue = (+(value ? value : 1) * 192).toFixed(fixedNum);
                break;
              case 'gallon':
                this.tmpValue = (+(value ? value : 1) * 0.25).toFixed(fixedNum);
                break;
              case 'pint':
                this.tmpValue = (+(value ? value : 1) * 2).toFixed(fixedNum);
                break;
              case 'cup':
                this.tmpValue = (+(value ? value : 1) * 4).toFixed(fixedNum);
                break;
              case 'tablespoons':
                this.tmpValue = (+(value ? value : 1) * 64).toFixed(fixedNum);
                break;
              case 'kilogram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.946352946 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'gram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 946.352946 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'milligram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 946352.946 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'pound':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 2.086351113005 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'milliliter':
                this.tmpValue = (+(value ? value : 1) * 946.352946).toFixed(
                  fixedNum
                );
                break;
              case 'liter':
                this.tmpValue = (+(value ? value : 1) * 0.946352946).toFixed(
                  fixedNum
                );
                break;
              case 'oz':
                this.tmpValue = (
                  +(value ? value : 1) *
                  33.3816 *
                  +Density
                ).toFixed(fixedNum);
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'teaspoons':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = (+(value ? value : 1) * 0.005208333333).toFixed(
                  fixedNum
                );
                break;
              case 'gallon':
                this.tmpValue = (+(value ? value : 1) * 0.001302083333).toFixed(
                  fixedNum
                );
                break;
              case 'pint':
                this.tmpValue = (+(value ? value : 1) * 0.01041666667).toFixed(
                  fixedNum
                );
                break;
              case 'cup':
                this.tmpValue = (+(value ? value : 1) * 0.02083333333).toFixed(
                  fixedNum
                );
                break;
              case 'tablespoons':
                this.tmpValue = (+(value ? value : 1) * 0.3333333333).toFixed(
                  fixedNum
                );
                break;
              case 'kilogram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.004928921594 * +Density * 0.001).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'gram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 4.928921594 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'milligram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 4928.921594 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'liter':
                this.tmpValue = (+(value ? value : 1) * 0.004928921594).toFixed(
                  fixedNum
                );

                break;
              case 'pound':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.01086641205 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'milliliter':
                this.tmpValue = (+(value ? value : 1) * 4.928921594).toFixed(
                  fixedNum
                );
                break;
              case 'oz':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.1738625928 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
            // ... (skipping some correct chunks to keep it clean, focusing on the ones I need to fix across the file)

          case 'gallon':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = (+(value ? value : 1) * 4).toFixed(fixedNum);
                break;

              case 'teaspoons':
                this.tmpValue = (+(value ? value : 1) * 768).toFixed(fixedNum);
                break;

              case 'pint':
                this.tmpValue = (+(value ? value : 1) * 8).toFixed(fixedNum);
                break;

              case 'cup':
                this.tmpValue = (+(value ? value : 1) * 16).toFixed(fixedNum);
                break;

              case 'tablespoons':
                this.tmpValue = (+(value ? value : 1) * 256).toFixed(fixedNum);
                break;

              case 'kilogram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 3.785411784 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'gram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 3785.411784 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'milligram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 3785411.784 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'liter':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 3.785411784).toFixed(fixedNum)
                  : 'Choose Density';
                break;

              case 'pound':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 8.345404452 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'milliliter':
                this.tmpValue = (+(value ? value : 1) * 3785.411784).toFixed(
                  fixedNum
                );
                break;

              case 'oz':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 133.5265 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'pint':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = (+(value ? value : 1) * 0.5).toFixed(fixedNum);
                break;

              case 'teaspoons':
                this.tmpValue = (+(value ? value : 1) * 96).toFixed(fixedNum);
                break;

              case 'gallon':
                this.tmpValue = (+(value ? value : 1) * 0.125).toFixed(
                  fixedNum
                );
                break;

              case 'cup':
                this.tmpValue = (+(value ? value : 1) * 2).toFixed(fixedNum);
                break;

              case 'tablespoons':
                this.tmpValue = (+(value ? value : 1) * 32).toFixed(fixedNum);
                break;

              case 'kilogram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.473176473 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'gram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 473.176473 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'milligram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 473176.473 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'liter':
                (+(value ? value : 1) * 0.473176473).toFixed(fixedNum);

                break;

              case 'pound':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 1.043175557 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'milliliter':
                this.tmpValue = (+(value ? value : 1) * 473.176473).toFixed(
                  fixedNum
                );
                break;

              case 'oz':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 16.6908 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'cup':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = (+(value ? value : 1) * 0.25).toFixed(fixedNum);
                break;

              case 'teaspoons':
                this.tmpValue = (+(value ? value : 1) * 48).toFixed(fixedNum);
                break;

              case 'gallon':
                this.tmpValue = (+(value ? value : 1) * 0.0625).toFixed(
                  fixedNum
                );
                break;

              case 'pint':
                this.tmpValue = (+(value ? value : 1) * 0.5).toFixed(fixedNum);
                break;

              case 'tablespoons':
                this.tmpValue = (+(value ? value : 1) * 16).toFixed(fixedNum);
                break;

              case 'kilogram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.2365882365 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'gram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 236.5882365 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'milligram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 236588.2365 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'liter':
                this.tmpValue = (+(value ? value : 1) * 0.236588236).toFixed(
                  fixedNum
                );

                break;

              case 'pound':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.5215877782 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'milliliter':
                this.tmpValue = (+(value ? value : 1) * 236.588236).toFixed(
                  fixedNum
                );
                break;
              case 'oz':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 8.345404451 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'tablespoons':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = (+(value ? value : 1) * 0.015625).toFixed(
                  fixedNum
                );
                break;

              case 'teaspoons':
                this.tmpValue = (+(value ? value : 1) * 3).toFixed(fixedNum);
                break;

              case 'gallon':
                this.tmpValue = (+(value ? value : 1) * 0.00390625).toFixed(
                  fixedNum
                );
                break;

              case 'pint':
                this.tmpValue = (+(value ? value : 1) * 0.03125).toFixed(
                  fixedNum
                );
                break;
              case 'cup':
                this.tmpValue = (+(value ? value : 1) * 0.0625).toFixed(
                  fixedNum
                );
                break;

              case 'kilogram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.01478676478 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'gram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 14.78676478 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'milligram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 14786.76478 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'liter':
                this.tmpValue = (+(value ? value : 1) * 0.01478676478).toFixed(
                  fixedNum
                );

                break;

              case 'pound':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.03259923614 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'milliliter':
                this.tmpValue = (+(value ? value : 1) * 14.78676478).toFixed(
                  fixedNum
                );
                break;
              case 'oz':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.521587778 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'gram':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.001056688).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'teaspoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.2028841362).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'gallon':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.000264172).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'pint':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.0021133764).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'cup':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.00422675).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'tablespoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.067628045).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'kilogram':
                this.tmpValue = (+(value ? value : 1) * 0.001).toFixed(fixedNum);
                break;

              case 'milligram':
                this.tmpValue = (+(value ? value : 1) * 1000).toFixed(
                  fixedNum
                );
                break;

              case 'liter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.001).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'pound':
                this.tmpValue = (+(value ? value : 1) * 0.00220462).toFixed(
                  fixedNum
                );
                break;

              case 'milliliter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 1).toFixed(fixedNum)
                  : 'Choose Density';
                break;
              case 'oz':
                this.tmpValue = (+(value ? value : 1) * 0.035274).toFixed(
                  fixedNum
                );
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
            // ... (skipping some correct chunks to keep it clean, focusing on the ones I need to fix across the file)
          case 'oz':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.029957).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'teaspoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 5.75167).toFixed(fixedNum)
                  : 'Choose Density';
                break;
              case 'gallon':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.007489).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'pint':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.059914).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'cup':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.119826).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'tablespoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 1.91722).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'gram':
                this.tmpValue = (+(value ? value : 1) * 28.349523).toFixed(
                  fixedNum
                );
                break;
              case 'milligram':
                this.tmpValue = (+(value ? value : 1) * 28349.52313).toFixed(
                  fixedNum
                );
                break;
              case 'kilogram':
                this.tmpValue = (+(value ? value : 1) * 0.0283495).toFixed(
                  fixedNum
                );
                break;
              case 'pound':
                this.tmpValue = (+(value ? value : 1) * 0.0625).toFixed(
                  fixedNum
                );
                break;
              case 'liter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.0283495).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'milliliter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 28.3495).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          default:
            break;
        }
        break;
      case 'length':
        switch (measureFrom) {
          case 'c-meters':
            switch (measurmentTo) {
              case 'meters':
                this.tmpValue = value ? (+value / 100).toFixed(fixedNum) : 1;
                break;
              case 'kilometers':
                this.tmpValue = value
                  ? (+value / 100000).toFixed(fixedNum)
                  : 1;
                break;
              case 'inches':
                this.tmpValue = value
                  ? (+value / 2.54).toFixed(fixedNum)
                  : 1;
                break;
              case 'feet':
                this.tmpValue = value
                  ? (+value / 30.48).toFixed(fixedNum)
                  : 1;
                break;
              case 'yards':
                this.tmpValue = value
                  ? (+value / 91.44).toFixed(fixedNum)
                  : 1;
                break;
              default:
                break;
            }
            break;
          case 'meters':
            switch (measurmentTo) {
              case 'c-meters':
                this.tmpValue = value ? (+value * 100).toFixed(fixedNum) : 1;
                break;
              case 'kilometers':
                this.tmpValue = value
                  ? (+value / 1000).toFixed(fixedNum)
                  : 1;
                break;
              case 'inches':
                this.tmpValue = value
                  ? (+value * 39.3701).toFixed(fixedNum)
                  : 1;
                break;
              case 'feet':
                this.tmpValue = value
                  ? (+value * 3.28084).toFixed(fixedNum)
                  : 1;
                break;
              case 'yards':
                this.tmpValue = value
                  ? (+value * 1.09361).toFixed(fixedNum)
                  : 1;
                break;
              default:
                break;
            }
            break;
          case 'kilometers':
            switch (measurmentTo) {
              case 'c-meters':
                this.tmpValue = value
                  ? (+value * 100000).toFixed(fixedNum)
                  : 1;
                break;
              case 'meters':
                this.tmpValue = value
                  ? (+value * 1000).toFixed(fixedNum)
                  : 1;
                break;
              case 'inches':
                this.tmpValue = value
                  ? (+value * 39370.1).toFixed(fixedNum)
                  : 1;
                break;
              case 'feet':
                this.tmpValue = value
                  ? (+value * 3280.84).toFixed(fixedNum)
                  : 1;
                break;
              case 'yards':
                this.tmpValue = value
                  ? (+value * 1093.61).toFixed(fixedNum)
                  : 1;
                break;
              default:
                break;
            }
            break;
          case 'inches':
            switch (measurmentTo) {
              case 'c-meters':
                this.tmpValue = value
                  ? (+value * 2.54).toFixed(fixedNum)
                  : 1;
                break;
              case 'meters':
                this.tmpValue = value
                  ? (+value * 0.0254).toFixed(fixedNum)
                  : 1;
                break;
              case 'kilometers':
                this.tmpValue = value
                  ? (+value * 0.0000254).toFixed(fixedNum)
                  : 1;
                break;
              case 'feet':
                this.tmpValue = value ? (+value / 12).toFixed(fixedNum) : 1;
                break;
              case 'yards':
                this.tmpValue = value ? (+value / 36).toFixed(fixedNum) : 1;
                break;
              default:
                break;
            }
            break;
          case 'feet':
            switch (measurmentTo) {
              case 'c-meters':
                this.tmpValue = value
                  ? (+value * 30.48).toFixed(fixedNum)
                  : 1;
                break;
              case 'meters':
                this.tmpValue = value
                  ? (+value * 0.3048).toFixed(fixedNum)
                  : 1;
                break;
              case 'kilometers':
                this.tmpValue = value
                  ? (+value * 0.0003048).toFixed(fixedNum)
                  : 1;
                break;
              case 'inches':
                this.tmpValue = value ? (+value * 12).toFixed(fixedNum) : 1;
                break;
              case 'yards':
                this.tmpValue = value ? (+value / 3).toFixed(fixedNum) : 1;
                break;
              default:
                break;
            }
            break;
          case 'yards':
            switch (measurmentTo) {
              case 'c-meters':
                this.tmpValue = value
                  ? (+value * 91.44).toFixed(fixedNum)
                  : 1;
                break;
              case 'meters':
                this.tmpValue = value
                  ? (+value * 0.9144).toFixed(fixedNum)
                  : 1;
                break;
              case 'kilometers':
                this.tmpValue = value
                  ? (+value * 0.0009144).toFixed(fixedNum)
                  : 1;
                break;
              case 'inches':
                this.tmpValue = value ? (+value * 36).toFixed(fixedNum) : 1;
                break;
              case 'feet':
                this.tmpValue = value ? (+value * 3).toFixed(fixedNum) : 1;
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }
        break;
      case 'temperature':
        switch (measureFrom) {
          case 'Fahr':
            switch (measurmentTo) {
              case 'Celsius':
                this.tmpValue = value
                  ? ((+value - 32) * (5 / 9)).toFixed(fixedNum)
                  : 1;
                break;
              case 'Kelvin':
                this.tmpValue = value
                  ? ((+value - 32) * (5 / 9) + 273.15).toFixed(fixedNum)
                  : 1;
                break;
            }
            break;
          case 'Celsius':
            switch (measurmentTo) {
              case 'Fahr':
                this.tmpValue = value
                  ? (+value * (9 / 5) + 32).toFixed(fixedNum)
                  : 1;
                break;
              case 'Kelvin':
                this.tmpValue = value ? (+value + 273.15).toFixed(fixedNum) : 1;
                break;
            }
            break;
          case 'Kelvin':
            switch (measurmentTo) {
              case 'Celsius':
                this.tmpValue = value ? (+value - 273.15).toFixed(fixedNum) : 1;
                break;
              case 'Fahr':
                this.tmpValue = value
                  ? ((+value - 273.15) * (9 / 5) + 32).toFixed(fixedNum)
                  : 1;
                break;
            }
            break;
        }
        break;
      default:
        break;
    }

    return this.tmpValue > this.maxAmout ? 'N/A' : this.tmpValue;
  }
}
