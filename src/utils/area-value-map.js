import flatMap from 'lodash/flatMap';

const data = require('./area.json');

const areaValueMap = new Map();
const flatChildren = children => flatMap(children, ({ children: c = [], ...item }) => [item, ...flatChildren(c)]);
flatChildren(data).map(item => areaValueMap.set(item.value, item));

export default areaValueMap;

// const labelValue = value.map(val => valueMap.get(val).label);
