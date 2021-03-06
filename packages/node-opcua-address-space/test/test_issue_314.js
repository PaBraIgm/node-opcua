"use strict";
const should = require("should");

const generate_address_space = require("..").generate_address_space;
const AddressSpace = require("..").AddressSpace;
const DataType = require("node-opcua-variant").DataType;
const path = require("path");
const fs = require("fs");
const nodesets = require("node-opcua-nodesets");

const describe = require("node-opcua-leak-detector").describeWithLeakDetector;

describe("testing loading ExtensonObject value from NodeSet XML file", function () {

    this.timeout(20000); // could be slow on appveyor !

    let addressSpace;

    beforeEach(function () {

        addressSpace = new AddressSpace();
    });
    afterEach(function (done) {
        if (addressSpace) {
            addressSpace.dispose();
            addressSpace = null;
        }
        done();
    });

    it("#314 should load a EUInformation value from nodeset xml file", function (done) {

        const xml_file = path.join(__dirname, "../test_helpers/test_fixtures/nodeset_with_analog_items.xml");
        fs.existsSync(xml_file).should.be.eql(true);

        const xml_files = [
            nodesets.standard_nodeset_file,
            nodesets.di_nodeset_filename,
            xml_file
        ];
        generate_address_space(addressSpace, xml_files, function (err) {

            const nodeId = "ns=2;i=6038";
            const node = addressSpace.findNode(nodeId);
            node.browseName.toString().should.eql("EngineeringUnits");

            node.readValue().value.dataType.should.eql(DataType.ExtensionObject);
            node.readValue().value.value.constructor.name.should.eql("EUInformation");
            node.readValue().value.value.namespaceUri.should.eql("http://www.opcfoundation.org/UA/units/un/cefact");
            node.readValue().value.value.unitId.should.eql(5066068);
            node.readValue().value.value.displayName.toString().should.eql("locale=null text=mm");
            node.readValue().value.value.description.toString().should.eql("locale=meter text=millimetre");

            done(err);
        });
    });
});
