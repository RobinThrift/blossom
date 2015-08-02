
import sinon from 'sinon';
export function chainableSpy(name, obj) {
    obj[`_${name}`] = sinon.spy();
    obj[name] = (...args) => {
        obj[`_${name}`].apply(obj, args);
        return obj;
    };
}
