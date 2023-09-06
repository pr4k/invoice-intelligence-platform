import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TableComponent from './TableComponent';
import { pdfjs } from 'react-pdf';
import { ArrowRightCircleFill, ArrowLeftCircleFill } from 'react-bootstrap-icons';
import axios from 'axios';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const PDFTableComponent = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [tableData, setTableData] = useState([])
  const [pdfUrl, setPdfUrl] = useState(null)
  const [invoiceNum, setInvoiceNum] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [vendorName, setvendorName] = useState('')
  useEffect(() => {
    const apiUrl = `${process.env.REACT_APP_INVOICE_URL}/${pageNumber}`;
    axios.get(apiUrl)
      .then((response) => {
        const data = response.data.response.invoice
        const keys = Object.keys(data);
        // const Ukeys = Object.keys(data);
        // const keys = keys.filter((key) => !key.startsWith('Unnamed'));
        const tableData = [];

        // Loop through the objects and create an array of objects
        for (let i = 0; i < Object.values(data[keys[0]]).length; i++) {
          const obj = {};
          for (const key of keys) {
            obj[key] = data[key][i];
          }
          tableData.push(obj);
        }
        console.log(tableData)
        setTableData(tableData)
        setPdfUrl(response.data.response.pdf_link)
        setInvoiceNum(response.data.response.invoice_number)
        setInvoiceDate(response.data.response.invoice_date)
        setvendorName(response.data.response.vendor_name)
        console.log(response.data.response);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [pageNumber]);

  return (
    <Container className='mt-4'>
      <Row>
        <Col md={6}>
          <div
            style={{
              height: '530px',
            }}
          >
            <iframe title='pdf' src={pdfUrl} width = "640" height = "530" frameborder="0" allow='autoplay'></iframe>
          </div>
          <div style={{ textAlign: 'justify' }} className='my-4 container'>
            <div className='my-2'>
              Invoice Number:{' '}
              <span style={{ backgroundColor: '#f0f0f0', padding: '3px' }}>{invoiceNum}</span>
            </div>
            <div className='my-2'>
              Vendor Name:{' '}
              <span style={{ backgroundColor: '#f0f0f0', padding: '3px' }}>{vendorName}</span>
            </div>
            <div className='my-2'>
              Invoice Date:{' '}
              <span style={{ backgroundColor: '#f0f0f0', padding: '3px' }}>{invoiceDate}</span>
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className='mb-4' style={{ overflowX: 'scroll', overflowY: "scroll" }}>
            <TableComponent data={tableData} />
          </div>
          <span className='m-4'><ArrowLeftCircleFill onClick={()=>{setPageNumber(pageNumber-1)}} size={40} /></span>
          <span className='m-4 p-2'><button className='btn btn-secondary'>{pageNumber}</button></span>
          <span className='m-4'><ArrowRightCircleFill onClick={()=>{setPageNumber(pageNumber+1)}} size={40} /></span>
        </Col>
      </Row>
    </Container>
  );
};

export default PDFTableComponent;
