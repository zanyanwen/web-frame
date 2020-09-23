import { observable } from 'mobx';

const { MobxAdministrationSymbol, MobxObservableValueConstructor } = (() => {
  class GetSymbol {
    @observable name = 1;
  }
  const getSymbol = new GetSymbol();
  getSymbol.name = 2;
  const AdminSymbol = Object.getOwnPropertySymbols(getSymbol).find(
    symbol => symbol.toString() === 'Symbol(mobx administration)',
  );

  const ObConstructor = getSymbol[AdminSymbol].values.get('name').constructor;

  return {
    MobxAdministrationSymbol: AdminSymbol,
    MobxObservableValueConstructor: ObConstructor,
  };
})();

export const getObservableProps = object => {
  const { values } = object[MobxAdministrationSymbol];
  return Array.from(values.keys()).filter(k => values.get(k).constructor === MobxObservableValueConstructor);
};

export { MobxAdministrationSymbol, MobxObservableValueConstructor };
