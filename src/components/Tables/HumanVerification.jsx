import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "react-tooltip";
import axios from "axios";
import { toast } from "react-toastify";
import { PlusCircleFill } from "react-bootstrap-icons";
import CombinedCols from "../Modals/CombinedCols";
import UnrecognizedCols from "../Modals/UnrecognizedCols";
import ResizableCell from "../Utility/ResizableCell";
import InvoiceDetail from "../Utility/InvoiceDetail";

export default function HumanVerification({
  invoiceTableData,
  setInvoiceTableData,
  respData,
  invoiceTotalFromtable,
  extraDiscountsAdded,
  invoiceTaxes,
  width,
  invTableheaders,
  rowDataForExtendedPrice,
  additionalCols,
  setAdditionalCols,
  tableSpecificAddCols,
  additionalHeaders,
  numberOfRows,
  additionalColsTables,
  extraChargesAdded,
  setExtraChargesAdded,
  setPageNumber,
  pageNumber,
  setSaved,
  setExtraDiscountsAdded,
  setInvoiceTotal,
  invoiceTotal
}) {
  const [extraDiscountsSum, setExtraDiscountsSum] = useState(0);
  const [invoiceTaxesSum, setInvoiceTaxesSum] = useState(0);
  const [discounts, setDiscounts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [changed, setChanged] = useState(false);
  const [rowId, setRowId] = useState(-1);
  const [editableRow, setEditableRow] = useState(-1);
  const [changedInputs, setChangedInputs] = useState([]);
  const [newPayload, setPayload] = useState({ row_id: null, row_data: {} });
  const [editDiscount, setEditDiscount] = useState(false);
  const [editTax, setEditTax] = useState(false);
  const [sum, setSum] = useState(0);
  const [extendedPriceColIndex, setExtendedPriceColIndex] = useState(0);
  const [dataForEditabletable, setDataForEditableTable] = useState([]);
  const [invNewTableheaders, setInvNewTableHeaders] = useState([]);
  const [dataForAdditionaltable, setDataForAdditionalTable] = useState([]);
  const [invAdditionalTableheaders, setInvAdditionalTableHeaders] = useState(
    []
  );
  const [dataForTableSpecificAddTab, setDataForTableSpecificAddTab] = useState(
    []
  );
  const [additionalTableheaders, setAdditionalTableHeaders] = useState([]);
  const [show, setShow] = useState(false);
  const [showTwo, setShowTwo] = useState(false);
  const [tableNames, setTableNames] = useState([]);
  const [selectedTable, setSelectedTable] = useState(false);
  const [selectedTableName, setSelectedTableName] = useState("");
  const [addTabData, setAddTabData] = useState([]);
  const [headerIndex, setHeaderIndex] = useState(null);
  const [taxEdit, setTaxEdit] = useState(false);
  const [discountEdit, setDiscountEdit] = useState(false);
  const [calculatedSum, setCalculatedSum] = useState(0);
  const [additionIndex, setAdditionIndex] = useState(null);
  const [addTax, setAddTax] = useState(false);
  const [addDiscount, setAddDiscount] = useState(false);
  const [newTax, setNewTax] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [tempTotal, setTempTotal] = useState(0);
  const [editTotal, setEditTotal] = useState(false);
  const tableRef = useRef(null);
  const containerRef = useRef(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCloseTwo = () => setShowTwo(false);
  const handleShowTwo = () => setShowTwo(true);

  useEffect(() => {
    const calculateSum = () => {
      let updatedSum = 0;

      Object.keys(dataForEditabletable).forEach((key) => {
        const value = dataForEditabletable[key][extendedPriceColIndex]?.text;
        if (value) {
          updatedSum += parseFloat(value);
        }
      });

      setSum(updatedSum);
    };

    if (discountEdit) {
      return;
    } else if (
      extraDiscountsAdded?.[0] === "NA" ||
      extraDiscountsAdded?.length === 0 ||
      isNaN(extraDiscountsAdded?.[0])
    ) {
      setDiscounts([0]);
    } else {
      setDiscounts(extraDiscountsAdded);
    }

    if (taxEdit) {
      return;
    } else if (
      extraChargesAdded?.[0] === "NA" ||
      extraChargesAdded?.length === 0 ||
      isNaN(extraChargesAdded?.[0])
    ) {
      setTaxes([0]);
    } else {
      setTaxes(extraChargesAdded);
    }
    setExtraDiscountsSum(
      discounts?.[0] === "NA" ||
        discounts?.length === 0 ||
        isNaN(discounts?.[0])
        ? 0
        : discounts?.reduce((acc, discount) => acc + discount, 0)
    );

    setInvoiceTaxesSum(
      taxes?.[0] === "NA" || taxes?.length === 0 || isNaN(taxes?.[0])
        ? 0
        : taxes?.reduce((acc, tax) => acc + tax, 0)
    );

    setInvNewTableHeaders(
      Object.values(invoiceTableData[0]).map((entry) => entry.text)
    );

    setDataForEditableTable(invoiceTableData.slice(1, invoiceTableData.length));

    if (!additionalCols[0] || Object.keys(additionalCols[0]).length === 0) {
      console.log("coming here");
      setInvAdditionalTableHeaders([]);
      setDataForAdditionalTable([]);
    } else {
      console.log("coming here aa");
      setInvAdditionalTableHeaders(
        Object.values(additionalCols[0]).map((entry) => entry.text)
      );
      setDataForAdditionalTable(additionalCols.slice(1, additionalCols.length));
    }

    setExtendedPriceColIndex(
      invNewTableheaders.findIndex((header) => header === "Extended Price")
    );
    setTableNames(Object.keys(numberOfRows));

    calculateSum();
    findCalculatedSum();
  }, [
    discounts,
    taxes,
    dataForEditabletable,
    extendedPriceColIndex,
    invoiceTableData,
    invNewTableheaders,
    editableRow,
    extraChargesAdded
  ]);

  const handleDiscountChange = (e) => {
    let discountValue;
    if (isNaN(e.target.value) || !e.target.value) {
      discountValue = 0;
    } else {
      discountValue = parseFloat(e.target.value);
    }
    setExtraDiscountsSum(discountValue);
    setDiscountEdit(true);
    setDiscounts([discountValue]);
  };

  const handleInputChangeTaxAddition = (event) => {
    setNewTax(event.target.value);
  };

  const addNewTax = () => {
    setTaxEdit(false)
    console.log("adding a new tax")
    if (newTax.trim() !== "") {
      const taxArray = [...extraChargesAdded];
      if(taxArray[0] === "NA") {
        taxArray.shift();
      }
      taxArray.push(parseFloat(newTax));
      setExtraChargesAdded(taxArray);
      setAddTax(false)
      setEditTax(false)
      setNewTax("");
    }
  };

  const handleInputChangeDiscountAddition = (event) => {
    setNewDiscount(event.target.value);
  };

  const addNewDiscount = () => {
    setDiscountEdit(false)
    console.log("adding a new tax")
    if (newDiscount.trim() !== "") {
      const discountArray = [...extraDiscountsAdded];
      if(discountArray[0] === "NA") {
        discountArray.shift();
      }
      discountArray.push(parseFloat(newDiscount));
      setExtraDiscountsAdded(discountArray)
      setNewDiscount("");
    }
    else{
      console.log("erro")
    }
  };

  const handleTaxChange = (e) => {
    let taxValue;
    if (isNaN(e.target.value) || !e.target.value) {
      taxValue = 0;
    } else {
      taxValue = parseFloat(e.target.value);
    }

    setInvoiceTaxesSum(taxValue);
    setTaxEdit(true);
    setTaxes([taxValue]);
  };

  const findCalculatedSum = () => {
    const calcSum = (
      sum -
      extraDiscountsSum +
      parseFloat(invoiceTaxesSum)
    ).toFixed(2);
    setCalculatedSum(calcSum);
    return calcSum;
  };

  useEffect(() => {
    findCalculatedSum();
  }, [discounts, taxes]);

  const setDataForTableSpecificTable = (tableName) => {
    setSelectedTable(true);
    setSelectedTableName(tableName);
    const data2 = additionalColsTables[tableName];
    if (data2 && Object.keys(data2).length === 0) {
      setAdditionalTableHeaders([]);
      setDataForTableSpecificAddTab([]);
      setAddTabData([]);
      return;
    }
    if (data2 && Object.keys(data2).length > 0) {
      const keys2 = Object.keys(data2);
      const additionalTableSpecificCols = [];

      for (let i = 0; i < Object.values(data2[keys2[0]]).length; i++) {
        const obj = {};
        for (const key of keys2) {
          obj[key] = data2[key][i];
        }
        additionalTableSpecificCols.push(obj);
        setAdditionalTableHeaders(
          Object.values(additionalTableSpecificCols[0]).map(
            (entry) => entry.text
          )
        );
        setAddTabData(additionalTableSpecificCols);
        setDataForTableSpecificAddTab(
          additionalTableSpecificCols.slice(
            1,
            additionalTableSpecificCols.length
          )
        );
      }
    } else {
      setAdditionalTableHeaders([]);
      setDataForTableSpecificAddTab([]);
    }
  };

  const generateEmptyRow = () => {
    const emptyRow = {};
    for (let i = 0; i < invNewTableheaders.length; i++) {
      emptyRow[i] = {
        confidence: 100,
        text: "",
      };
    }
    return emptyRow;
  };

  const addEmptyRow = () => {
    console.log("who called me to add an empty row");
    setInvoiceTableData((prevData) => [...prevData, generateEmptyRow()]);
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const deleteRow = (deleteRowId) => {
    const updatedData = [...invoiceTableData];
    updatedData.splice(deleteRowId + 1, 1);
    setInvoiceTableData(updatedData);
    toast.success(`Row  ${deleteRowId} deleted successfully!,`);
  };

  // Function to handle the edit click
  const handleEditIconClick = (rowId) => {
    setEditableRow(rowId);
    const initialRowData = {};
    invNewTableheaders.forEach((header) => {
      initialRowData[header] = String(
        dataForEditabletable[rowId][invNewTableheaders.indexOf(header)]?.text
      );
    });
    console.log("the initial data", initialRowData);
    setPayload({ row_id: rowId, row_data: initialRowData });
  };

  // Function to handle input changes
  const handleInputChange = (header, value) => {
    setPayload((prevPayload) => ({
      ...prevPayload,
      row_data: {
        ...prevPayload.row_data,
        [header]: String(value),
      },
    }));
  };

  const calculateExtendedPrice = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_EXTENDED_PRICE}`,
        newPayload
      );

      const updatedDataForEditableTable = [...dataForEditabletable];
      updatedDataForEditableTable[rowId][extendedPriceColIndex].text =
        response.data["Extended Price"].text;
      updatedDataForEditableTable[rowId][extendedPriceColIndex].confidence =
        response.data["Extended Price"].confidence;
      changedInputs.forEach((entry) => {
        updatedDataForEditableTable[rowId][entry.indexId].text = entry.value;
      });

      // Update the state with the new data
      setDataForEditableTable(updatedDataForEditableTable);

      toast.success("Extended Price Calculated Successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      setEditableRow(-1);
      setRowId(-1);
      setChanged(false);
      setChangedInputs([]);
      setPayload({ row_id: null, row_data: {} });
    } catch (error) {
      console.log("Error:", error);
      toast.error("Error calculating Extended Price.");
    }
  };

  // Function to handle the save click
  const handleSaveClick = async () => {
    try {
      const payload = { ...respData };
      const updatedData = [...dataForEditabletable];
      updatedData.unshift(invoiceTableData[0]);
      console.log("first", updatedData);
      const reversedData = {};
      const keys = Object.keys(updatedData[0]);
      for (const key of keys) {
        reversedData[key] = {};
      }

      // Iterate over the data and populate the reversedData object
      for (const obj of updatedData) {
        for (const key of keys) {
          reversedData[key] = {
            ...reversedData[key],
            [updatedData.indexOf(obj)]: obj[key],
          };
        }
      }
      payload["invoice_1"] = reversedData;
      payload["invoice_metadata"]["extra_discounts_added"] = extraDiscountsAdded;
      payload["invoice_metadata"]["extra_charges_added"] = extraChargesAdded;
      console.log("Updated payload:", payload["invoice_metadata"]);
      await axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/save_invoice`, payload)
        .then((res) => {
          console.log("Response from backend:", res);
          toast.success("Invoice saved successfully!");
          setSaved(true);
        })
        .catch((err) => {
          console.log("Error in saving invoice:", err);
          toast.error("Error in saving invoice.");
        });
    } catch (error) {
      console.error("Error in handleSaveClick:", error);
    }
  };
  console.log(invNewTableheaders);

  const handleHeaderChange = (e, index) => {
    const newHeader = e.target.value;
    const updatedData = [...invoiceTableData];
    updatedData[0][index].text = newHeader;
    updatedData[0][index].confidence = 100;
    setInvoiceTableData(updatedData);
  };

  const addNewColumn = (e, index) => {
    try {
      const updatedData = [...invoiceTableData];
      updatedData[0][Object.keys(updatedData[0]).length] =
        additionalCols[0][index];
      for (let i = 1; i < updatedData.length; i++) {
        updatedData[i][Object.keys(updatedData[0]).length - 1] =
          additionalCols[i][index];
      }
      console.log("the add cols are", additionalCols);
      // // Remove the added column from additionalCols
      // const updatedAdditionalCols = additionalCols.map((col) => {
      //   const updatedCol = { ...col };
      //   console.log("the column to be removed is", updatedCol[index])
      //   delete updatedCol[index];
      //   return updatedCol;
      // });
      toast.success("Column added successfully!");
      setShow(false);
      setShowTwo(false);
      setInvoiceTableData(updatedData);
    } catch (error) {
      console.log("An error occurred:", error);
      toast.error("An error occurred while adding the column.");
    }
  };

  const addColumnFromTableSpecificAdditionalColumns = async (e, index) => {
    let startIndex = 0;
    const tableStartIndex = {};
    Object.keys(numberOfRows).forEach((tableName) => {
      tableStartIndex[tableName] = startIndex;
      startIndex += numberOfRows[tableName];
    });
    console.log("who called me to add a column");
    const updatedData = [...invoiceTableData];
    if (selectedTableName === "table_1") {
      updatedData[0][Object.keys(updatedData[0]).length] = addTabData[0][index];
      for (let i = 1; i < updatedData.length; i++) {
        const columnIndex = Object.keys(updatedData[0]).length - 1;
        if (
          dataForTableSpecificAddTab[i] &&
          dataForTableSpecificAddTab[i].length > index
        ) {
          console.log(
            "pehle wale mai its",
            dataForTableSpecificAddTab[i].length
          );
          updatedData[i][columnIndex] = dataForTableSpecificAddTab[i][index];
        } else {
          console.log(
            "pehle wale mai its",
            dataForTableSpecificAddTab[i].length
          );
          updatedData[i][columnIndex] = { text: "", confidence: 1 };
        }
      }
      toast.success("Column added successfully!");
      setShowTwo(false);
      setInvoiceTableData(updatedData);
    } else {
      const startingIndex = tableStartIndex[selectedTableName];
      const nextStartingIndex =
        tableStartIndex[selectedTableName] + numberOfRows[selectedTableName];
      console.log("The starting index is", startingIndex);
      for (let i = startingIndex; i < nextStartingIndex - 1; i++) {
        const columnIndex = headerIndex;
        console.log("The column index is", columnIndex);
        console.log(
          "The data for table specific add tab is",
          dataForTableSpecificAddTab
        );
        const dataIndex = i === startingIndex ? 0 : i - startingIndex;
        console.log("the row", dataForTableSpecificAddTab[dataIndex]);
        console.log("the index", dataIndex);
        if (dataIndex < dataForTableSpecificAddTab.length) {
          console.log("coming here one");
          if (!updatedData[i]) {
            console.log("Creating new entry for index", i);
            updatedData[i] = {};
          }
          updatedData[i][columnIndex] =
            dataForTableSpecificAddTab[dataIndex][index];
        } else {
          console.log("coming here two");
          if (!updatedData[i]) {
            console.log("Creating new entry for index", i);
            updatedData[i] = {};
          }
          updatedData[i][columnIndex] = { text: "", confidence: 1 };
        }
      }
      toast.success("Column merged successfully!");
      setAdditionIndex(null);
      setHeaderIndex(null);
      setShowTwo(false);
      setInvoiceTableData(updatedData);
    }
  };

  return (
    <>
      <div
      ref={containerRef}
        style={{
          width: width || "100%",
          height: "471px",
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <table ref={tableRef} className="table table-striped table-responsive table-bordered">
          <thead>
            <tr>
              {invNewTableheaders.map((header, index) => (
                <th
                  style={{
                    backgroundColor: "#FFF2CD",
                    textTransform: "capitalize",
                    verticalAlign: "middle",
                  }}
                  key={index}
                  className="resizable-header"
                >
                  <ResizableCell style={{ width: 150 }}>
                    <div
                      style={{
                        lineHeight: "1.5",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <select
                        className="form-select"
                        onChange={(e) => handleHeaderChange(e, index)}
                      >
                        <option value={header}>{header}</option>
                        {additionalHeaders.map((option, index) => (
                          <option
                            key={index}
                            value={option}
                            disabled={invNewTableheaders.includes(option)}
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </ResizableCell>
                </th>
              ))}
              <th
                style={{
                  backgroundColor: "#FFF2CD",
                  textTransform: "capitalize",
                  verticalAlign: "middle",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(dataForEditabletable).map((key, rowIndex) => (
              <tr key={rowIndex}>
                {invNewTableheaders.map((header, colIndex) => (
                  <td
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Confidence: ${dataForEditabletable[key][colIndex]?.confidence}`}
                    key={colIndex}
                    onClick={() => {
                      setRowId(key);
                      setEditableRow(key);
                      handleEditIconClick(key);
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: `${
                        dataForEditabletable[key][colIndex]?.confidence < 60
                          ? "#F8C8BE"
                          : null
                      }`,
                    }}
                    className={`${
                      dataForEditabletable[key][colIndex]?.confidence < 60
                        ? "border border-danger"
                        : "border border-success"
                    }`}
                  >
                    {editableRow === key ? (
                      <input
                        className="form-control"
                        width={"100%"}
                        value={
                          changed
                            ? rowDataForExtendedPrice.header
                            : dataForEditabletable[key][colIndex]?.text
                        }
                        disabled={header === "Extended Price" ? true : false}
                        onChange={(e) => {
                          handleInputChange(header, e.target.value);
                          setChanged(true);
                          setChangedInputs([
                            ...changedInputs,
                            { indexId: colIndex, value: e.target.value },
                          ]);
                        }}
                        onBlur={(e) => {
                          calculateExtendedPrice();
                          console.log("the col index is", colIndex);
                        }}
                      ></input>
                    ) : (
                      <>
                        {dataForEditabletable[key][colIndex]?.text}
                        <Tooltip id={colIndex} />
                      </>
                    )}
                  </td>
                ))}
                <td>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="25"
                    height="25"
                    viewBox="0,0,256,256"
                    style={{ fill: "#000000", cursor: "pointer" }}
                    onClick={() => {
                      deleteRow(rowIndex);
                    }}
                  >
                    <g
                      fill-opacity="0.74902"
                      fill="#f60000"
                      fill-rule="nonzero"
                      stroke="none"
                      stroke-width="1"
                      stroke-linecap="butt"
                      stroke-linejoin="miter"
                      stroke-miterlimit="10"
                      stroke-dasharray=""
                      stroke-dashoffset="0"
                      font-family="none"
                      font-weight="none"
                      font-size="none"
                      text-anchor="none"
                      style={{ mixBlendMode: "normal" }}
                    >
                      <g transform="scale(8.53333,8.53333)">
                        <path d="M14.98438,2.48633c-0.55152,0.00862 -0.99193,0.46214 -0.98437,1.01367v0.5h-5.5c-0.26757,-0.00363 -0.52543,0.10012 -0.71593,0.28805c-0.1905,0.18793 -0.29774,0.44436 -0.29774,0.71195h-1.48633c-0.36064,-0.0051 -0.69608,0.18438 -0.87789,0.49587c-0.18181,0.3115 -0.18181,0.69676 0,1.00825c0.18181,0.3115 0.51725,0.50097 0.87789,0.49587h18c0.36064,0.0051 0.69608,-0.18438 0.87789,-0.49587c0.18181,-0.3115 0.18181,-0.69676 0,-1.00825c-0.18181,-0.3115 -0.51725,-0.50097 -0.87789,-0.49587h-1.48633c0,-0.26759 -0.10724,-0.52403 -0.29774,-0.71195c-0.1905,-0.18793 -0.44836,-0.29168 -0.71593,-0.28805h-5.5v-0.5c0.0037,-0.2703 -0.10218,-0.53059 -0.29351,-0.72155c-0.19133,-0.19097 -0.45182,-0.29634 -0.72212,-0.29212zM6,9l1.79297,15.23438c0.118,1.007 0.97037,1.76563 1.98438,1.76563h10.44531c1.014,0 1.86538,-0.75862 1.98438,-1.76562l1.79297,-15.23437z"></path>
                      </g>
                    </g>
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
  <div class="row justify-content-around mt-2 p-2 border border-gray rounded mx-2 text-center">
    <div class="col-3 mx-2 text-center">
      <PlusCircleFill
        onClick={() => {
          addEmptyRow();
        }}
        className="mx-auto fs-32 text-warning"
        style={{
          fontSize: "2rem",
          cursor: "pointer",
        }}
      ></PlusCircleFill>
      <p className="mx-auto text-center">Add Row</p>
    </div>

    <div class="col-3 mx-2 text-center">
      <PlusCircleFill
        onClick={() => {
          handleShow();
        }}
        className="mx-auto fs-32 text-warning"
        style={{
          fontSize: "2rem",
          cursor: "pointer",
        }}
        title="Click to view the processed columns"
      ></PlusCircleFill>
      <p className="mx-auto text-center">Add Processed Columns</p>
    </div>

    <div class="col-3 mx-2 text-center">
      <PlusCircleFill
        onClick={() => {
          handleShowTwo();
        }}
        className="mx-auto fs-32 text-warning"
        style={{
          fontSize: "2rem",
          cursor: "pointer",
        }}
        title="Click to view the unrecognized columns that were not compatible for combining with the processed columns"
      ></PlusCircleFill>
      <p className="mx-auto text-center">Unrecognized Columns</p>
    </div>
  </div>
</div>

      <InvoiceDetail 
      sum = {sum}
      extraDiscountsSum = {extraDiscountsSum}
      invoiceTaxesSum = {invoiceTaxesSum} 
      calculatedSum = {calculatedSum} 
      invoiceTotalFromtable = {invoiceTotalFromtable} 
      invoiceTotal = {invoiceTotal} 
      setInvoiceTotal = {setInvoiceTotal} 
      editTotal = {editTotal} 
      setEditTotal = {setEditTotal} 
      editDiscount = {editDiscount} 
      setEditDiscount = {setEditDiscount} 
      editTax = {editTax} 
      setEditTax = {setEditTax} 
      addDiscount = {addDiscount} 
      setAddDiscount = {setAddDiscount} 
      addTax = {addTax} 
      setAddTax = {setAddTax} 
      handleDiscountChange = {handleDiscountChange} 
      handleTaxChange = {handleTaxChange} 
      taxes = {taxes} 
      discounts = {discounts} 
      setDiscounts = {setDiscounts}
      newDiscount = {newDiscount} 
      handleInputChangeDiscountAddition = {handleInputChangeDiscountAddition} 
      addNewDiscount = {addNewDiscount} 
      newTax = {newTax} 
      handleInputChangeTaxAddition = {handleInputChangeTaxAddition} 
      addNewTax = {addNewTax}
      extraDiscountsAdded = {extraDiscountsAdded}
      setExtraDiscountsAdded = {setExtraDiscountsAdded}
      extraChargesAdded = {extraChargesAdded}
      setExtraChargesAdded = {setExtraChargesAdded}
      />
      <div className="d-flex justify-content-end my-2 mx-2 mb-4">
        <button
          className="shadow-lg btn mx-1 btn-sm"
          style={{ backgroundColor: "rgb(255, 242, 205)" }}
        >
          Accept
        </button>
        <button className="shadow-lg btn mx-1 btn-sm btn-danger">Reject</button>
        <button
          className="shadow-lg btn mx-1 btn-sm btn-warning"
          onClick={() => handleSaveClick()}
        >
          Save
        </button>
      </div>

      <CombinedCols
        show={show}
        handleClose={handleClose}
        invAdditionalTableheaders={invAdditionalTableheaders}
        dataForAdditionaltable={dataForAdditionaltable}
        addNewColumn={addNewColumn}
      />

      <UnrecognizedCols
        showTwo={showTwo}
        handleCloseTwo={handleCloseTwo}
        tableNames={tableNames}
        setDataForTableSpecificTable={setDataForTableSpecificTable}
        additionalTableheaders={additionalTableheaders}
        dataForTableSpecificAddTab={dataForTableSpecificAddTab}
        addColumnFromTableSpecificAdditionalColumns={
          addColumnFromTableSpecificAdditionalColumns
        }
        additionalHeaders={additionalHeaders}
        invNewTableheaders={invNewTableheaders}
        addTabData={addTabData}
        headerIndex={headerIndex}
        setHeaderIndex={setHeaderIndex}
        additionIndex={additionIndex}
        setAdditionIndex={setAdditionIndex}
        selectedTableName={selectedTableName}
        selectedTable={selectedTable}
      />
    </>
  );
}