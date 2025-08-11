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
    let fixedNum = 2;
    console.log('measureEvent');
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
                this.tmpValue = (+(value ? value : 1) / 0.005208333333).toFixed(
                  fixedNum
                );
                break;
              case 'gallon':
                this.tmpValue = (+(value ? value : 1) / 0.001302083333).toFixed(
                  fixedNum
                );
                break;
              case 'pint':
                this.tmpValue = (+(value ? value : 1) / 0.01041666667).toFixed(
                  fixedNum
                );
                break;
              case 'cup':
                this.tmpValue = (+(value ? value : 1) / 0.02083333333).toFixed(
                  fixedNum
                );
                break;
              case 'tablespoons':
                this.tmpValue = (+(value ? value : 1) / 0.3333333333).toFixed(
                  fixedNum
                );
                break;
              case 'kilogram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.004928921594 * +Density).toFixed(
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
                this.tmpValue = (+(value ? value : 1) * 1000).toFixed(fixedNum);
                break;

              case 'milligram':
                this.tmpValue = (+(value ? value : 1) * 0.001).toFixed(
                  fixedNum
                );
                break;

              case 'liter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.00220462).toFixed(
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
          case 'milligram':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.0000010567).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'teaspoons':
                this.tmpValue = Density
                  ? (
                      (+(value ? value : 1) / +Density) *
                      0.000202884136
                    ).toFixed(fixedNum)
                  : 'Choose Density';
                break;

              case 'gallon':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.00000026417).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'pint':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.0000021134).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'cup':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.0000042268).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'tablespoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.000067628).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'kilogram':
                this.tmpValue = (+(value ? value : 1) * 0.000001).toFixed(
                  fixedNum
                );
                break;

              case 'gram':
                this.tmpValue = (+(value ? value : 1) * 0.001).toFixed(
                  fixedNum
                );
                break;

              case 'liter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.000001).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'pound':
                this.tmpValue = (+(value ? value : 1) * 0.0000022046).toFixed(
                  fixedNum
                );
                break;

              case 'milliliter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.001).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'oz':
                this.tmpValue = (+(value ? value : 1) * 0.000035274).toFixed(
                  fixedNum
                );
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'kilogram':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 1.0566882).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'teaspoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 202.8841362).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'gallon':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.264172875).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'pint':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 2.1134).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'cup':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 4.2268).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'tablespoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 67.628).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'gram':
                this.tmpValue = (+(value ? value : 1) * 1000).toFixed(fixedNum);
                break;

              case 'milligram':
                this.tmpValue = (+(value ? value : 1) * 1000000).toFixed(
                  fixedNum
                );
                break;

              case 'liter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 1).toFixed(fixedNum)
                  : 'Choose Density';
                break;

              case 'pound':
                this.tmpValue = (+(value ? value : 1) * 2.20462).toFixed(
                  fixedNum
                );
                break;

              case 'milliliter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 1000).toFixed(fixedNum)
                  : 'Choose Density';
                break;
              case 'oz':
                this.tmpValue = (+(value ? value : 1) * 35.273962).toFixed(
                  fixedNum
                );
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'pound':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.4793057093).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'teaspoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 92.02669617).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'gallon':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.1198264273).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'pint':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.9586114185).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'cup':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 1.917222837).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'tablespoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 30.67556539).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'gram':
                this.tmpValue = (+(value ? value : 1) * 453.59237).toFixed(
                  fixedNum
                );
                break;

              case 'milligram':
                this.tmpValue = (+(value ? value : 1) * 453592.37).toFixed(
                  fixedNum
                );
                break;
              case 'kilogram':
                this.tmpValue = (+(value ? value : 1) * 0.45359237).toFixed(
                  fixedNum
                );
                break;

              case 'liter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.45359237).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;

              case 'milliliter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 453.59237).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'oz':
                this.tmpValue = (+(value ? value : 1) * 16).toFixed(fixedNum);
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'milliliter':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = (+(value ? value : 1) * 0.00105668821).toFixed(
                  fixedNum
                );
                break;
              case 'teaspoons':
                this.tmpValue = (+(value ? value : 1) * 0.202884136).toFixed(
                  fixedNum
                );
                break;
              case 'gallon':
                this.tmpValue = (+(value ? value : 1) * 0.000264172052).toFixed(
                  fixedNum
                );
                break;
              case 'pint':
                this.tmpValue = (+(value ? value : 1) * 0.00211337642).toFixed(
                  fixedNum
                );
                break;
              case 'cup':
                this.tmpValue = (+(value ? value : 1) * 0.00422675284).toFixed(
                  fixedNum
                );
                break;
              case 'tablespoons':
                this.tmpValue = (+(value ? value : 1) * 0.0676280454).toFixed(
                  fixedNum
                );
                break;
              case 'kilogram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.001 * +Density).toFixed(fixedNum)
                  : 'Choose Density';
                break;
              case 'gram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 1 * +Density).toFixed(fixedNum)
                  : 'Choose Density';
                break;
              case 'milligram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 1000 * +Density).toFixed(fixedNum)
                  : 'Choose Density';
                break;
              case 'liter':
                this.tmpValue = (+(value ? value : 1) * 0.001).toFixed(
                  fixedNum
                );

                break;
              case 'pound':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.002204622622 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'oz':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 0.0338140227 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'liter':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = (+(value ? value : 1) * 1.05668821).toFixed(
                  fixedNum
                );
                break;
              case 'teaspoons':
                this.tmpValue = (+(value ? value : 1) * 202.884136).toFixed(
                  fixedNum
                );
                break;
              case 'gallon':
                this.tmpValue = (+(value ? value : 1) * 0.264172).toFixed(
                  fixedNum
                );
                break;
              case 'pint':
                this.tmpValue = (+(value ? value : 1) * 2.113376).toFixed(
                  fixedNum
                );
                break;
              case 'cup':
                this.tmpValue = (+(value ? value : 1) * 4.226753).toFixed(
                  fixedNum
                );
                break;
              case 'tablespoons':
                this.tmpValue = (+(value ? value : 1) * 67.628045).toFixed(
                  fixedNum
                );
                break;
              case 'kilogram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 1 * +Density).toFixed(fixedNum)
                  : 'Choose Density';
                break;
              case 'gram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 1000 * +Density).toFixed(fixedNum)
                  : 'Choose Density';
                break;
              case 'milligram':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 1000000 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'milliliter':
                this.tmpValue = (+(value ? value : 1) * 1000).toFixed(fixedNum);

                break;
              case 'pound':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 2.204622622 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'oz':
                this.tmpValue = Density
                  ? (+(value ? value : 1) * 33.8140227 * +Density).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              default:
                this.tmpValue = "Can't Measure";
            }
            break;
          case 'oz':
            switch (measurmentTo) {
              case 'quart':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.03125).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'teaspoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 6).toFixed(fixedNum)
                  : 'Choose Density';
                break;
              case 'gallon':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.007812).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'pint':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.0625).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'cup':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 0.1198264273).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'tablespoons':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 1.917222837).toFixed(
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
                this.tmpValue = (+(value ? value : 1) * 0.02957352956).toFixed(
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
                  ? ((+(value ? value : 1) / +Density) * 0.029574).toFixed(
                      fixedNum
                    )
                  : 'Choose Density';
                break;
              case 'milliliter':
                this.tmpValue = Density
                  ? ((+(value ? value : 1) / +Density) * 29.57353).toFixed(
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
                this.tmpValue = value ? (+value / 100000).toFixed(fixedNum) : 1;
                break;
              case 'inches':
                this.tmpValue = value ? (+value * 0.3937).toFixed(fixedNum) : 1;
                break;
              case 'feet':
                this.tmpValue = value
                  ? ((+value / 100) * 3.2808).toFixed(fixedNum)
                  : 1;
                break;
              case 'yards':
                this.tmpValue = value
                  ? ((+value / 100) * 1.0936).toFixed(fixedNum)
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
                  ? ((+value / 1000) * 3.2808).toFixed(fixedNum)
                  : 1;
                break;
              case 'inches':
                this.tmpValue = value ? (+value * 39.37).toFixed(fixedNum) : 1;
                break;
              case 'feet':
                this.tmpValue = value ? (+value * 3.2808).toFixed(fixedNum) : 1;
                break;
              case 'yards':
                this.tmpValue = value ? (+value * 1.0936).toFixed(fixedNum) : 1;
                break;
              default:
                break;
            }
            break;
          case 'kilometers':
            switch (measurmentTo) {
              case 'c-meters':
                this.tmpValue = value ? (+value / 100000).toFixed(fixedNum) : 1;
                break;
              case 'meters':
                this.tmpValue = value ? (+value / 1000).toFixed(fixedNum) : 1;
                break;
              case 'inches':
                this.tmpValue = value ? (+value * 39374).toFixed(fixedNum) : 1;
                break;
              case 'feet':
                this.tmpValue = value
                  ? (+value * 0.003281).toFixed(fixedNum)
                  : 1;
                break;
              case 'yards':
                this.tmpValue = value ? (+value * 0.0011).toFixed(fixedNum) : 1;
                break;
              default:
                break;
            }
            break;
          case 'inches':
            switch (measurmentTo) {
              case 'c-meters':
                this.tmpValue = value ? (+value / 0.3937).toFixed(fixedNum) : 1;
                break;
              case 'meters':
                this.tmpValue = value
                  ? (+value / 100 / 0.3937).toFixed(fixedNum)
                  : 1;
                break;
              case 'kilometers':
                this.tmpValue = value
                  ? (+value / 100000 / 0.3937).toFixed(fixedNum)
                  : 1;
                break;
              case 'feet':
                this.tmpValue = value
                  ? (+value * 0.083334).toFixed(fixedNum)
                  : 1;
                break;
              case 'yards':
                this.tmpValue = value
                  ? (+value * 0.27778).toFixed(fixedNum)
                  : 1;
                break;
              default:
                break;
            }
            break;
          case 'feet':
            switch (measurmentTo) {
              case 'c-meters':
                this.tmpValue = value
                  ? (+value * (0.305 / 100)).toFixed(fixedNum)
                  : 1;
                break;
              case 'meters':
                this.tmpValue = value ? (+value * 0.305).toFixed(fixedNum) : 1;
                break;
              case 'kilometers':
                this.tmpValue = value
                  ? (+value * (0.305 / 100000)).toFixed(fixedNum)
                  : 1;
                break;
              case 'inches':
                this.tmpValue = value ? (+value / 0.3937).toFixed(fixedNum) : 1;
                break;
              case 'yards':
                this.tmpValue = value ? (+value / 0.3937).toFixed(fixedNum) : 1;
                break;
              default:
                break;
            }
            break;
          case 'yards':
            switch (measurmentTo) {
              case 'c-meters':
                break;
              case 'meters':
                break;
              case 'kilometers':
                break;
              case 'inches':
                break;
              case 'feet':
                break;
              default:
                break;
            }
            break;

          default:
            break;
        }
        break;
      default:
        break;
    }

    return this.tmpValue > this.maxAmout ? 'N/A' : this.tmpValue;
  }
}
