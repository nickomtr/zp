import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Navbar, Nav, Form, Button, Table, Modal } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import DatePicker from 'react-datepicker';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add icons to the library
library.add(faSun, faMoon, faPlus, faSave);

function App() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [tableData, setTableData] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [apparatOptions, setApparatOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [excelData, setExcelData] = useState({});
  const [selectedSheet, setSelectedSheet] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, rowIndex: null });

  useEffect(() => {
    axios.get('http://localhost:8000/items')
      .then(response => {
        setItems(response.data);
        setSelectedItem(response.data[0].id); // Select the first item by default
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveTableData();
    }, 60000); 
  
    return () => clearInterval(interval); // Clear interval on component unmount
  }, [tableData]);
  useEffect(() => {
    axios.get('http://localhost:8000/get_table_data')
      .then(response => {
        const formattedTableData = response.data.map(row => ({
          ...row,
          date: new Date(row.date)
        }));
        setTableData(formattedTableData);
      })
      .catch(error => {
        console.error('There was an error fetching the table data!', error);
      });
  }, []);
  

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'e' || event.key === 'E') {
        handleAddRow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tableData]);

  const handleSelect = (event) => {
    setSelectedItem(event.target.value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetsData = {};
      workbook.SheetNames.forEach(sheetName => {
        sheetsData[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      });
      setExcelData(sheetsData);
      setSelectedSheet(workbook.SheetNames[0]);
      setShowModal(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSheet('');
    setSelectedColumn('');
  };

  const handleModalSave = () => {
    const dataRows = excelData[selectedSheet].slice(1);
    const columnIndex = excelData[selectedSheet][0].indexOf(selectedColumn);
    const newData = dataRows.map(row => row[columnIndex]);

    if (uploadType === 'FIO') {
      setNameOptions(newData);
      toast.success('Ф.И.О. данные добавлены успешно!');
    } else if (uploadType === 'APPARAT') {
      setApparatOptions(newData);
      toast.success('Данные по аппаратам добавлены успешно!');
    }

    setShowModal(false);
  };

  const handleAddRow = () => {
    setTableData([...tableData, { date: new Date(), apparatName: '', fio1: '', fio2: '', fio3: '', fio4: '', fio5: '', tseh: '', night: false }]);
    toast.success('Строчка добавлена успешно!');
  };

  const handleNameSelect = (selected, index, colName) => {
    const newData = [...tableData];
    newData[index][colName] = selected.length > 0 ? selected[0] : '';
    setTableData(newData);
  };

  const handleCellChange = (event, index, colName) => {
    const newData = [...tableData];
    newData[index][colName] = event.target.value;
    setTableData(newData);
  };

  const handleDateChange = (date, index) => {
    const newData = [...tableData];
    newData[index].date = date;
    setTableData(newData);
  };

  const handleNightToggle = (index) => {
    const newData = [...tableData];
    newData[index].night = !newData[index].night;
    setTableData(newData);
  };

  const handleRightClick = (event, index) => {
    event.preventDefault();
    const scrollY = window.scrollY || window.pageYOffset;
    setContextMenu({ show: true, x: event.clientX, y: event.clientY + scrollY, rowIndex: index });
  };

  const handleDeleteRow = () => {
    const newData = tableData.filter((_, i) => i !== contextMenu.rowIndex);
    setTableData(newData);
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: null });
    toast.success('Строчка удалена успешно!');
  };

  const handleClickOutside = () => {
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: null });
  };

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSortByDate = () => {
    const newData = [...tableData];
    newData.sort((a, b) => new Date(a.date) - new Date(b.date));
    setTableData(newData);
  };

  const handleLoadFioFromDB = () => {
    axios.get('http://localhost:8000/fio_data')
      .then(response => {
        setNameOptions(response.data);
        toast.success('Ф.И.О. данные загружены с БД успешно!');
      })
      .catch(error => {
        console.error('Ошибка загрузки Ф.И.О. данных с БД!', error);
        toast.error('Ошибка загрузки Ф.И.О. данных с БД!');
      });
  };

  const handleSaveTableData = () => {
    // Format dates to strings before sending to the backend
    const formattedTableData = tableData.map(row => ({
      ...row,
      date: row.date.toISOString().split('T')[0],
      apparatName: row.apparatName || null,
      fio1: row.fio1 || null,
      fio2: row.fio2 || null,
      fio3: row.fio3 || null,
      fio4: row.fio4 || null,
      fio5: row.fio5 || null,
      tseh: row.tseh || null
    }));
    axios.post('http://localhost:8000/save_table_data', formattedTableData)
      .then(response => {
        toast.success('Table data saved successfully!');
        // Optionally refresh data from the server to get updated ids
        axios.get('http://localhost:8000/get_table_data')
          .then(response => {
            const formattedTableData = response.data.map(row => ({
              ...row,
              date: new Date(row.date)
            }));
            setTableData(formattedTableData);
          })
          .catch(error => {
            console.error('There was an error fetching the table data!', error);
          });
      })
      .catch(error => {
        console.error('Ошибка сохранения данных!', error);
        toast.error('Error saving table data!');
      });
  };
  
  

  return (
    <Container fluid>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Row>
        <Col>
          <Navbar bg="dark" variant="dark" className="mb-3">
            <Container>
              <Navbar.Brand>ЛАВАРТ</Navbar.Brand>
              <Nav className="ml-auto">
                <Form inline>
                  <Form.Control 
                    as="select" 
                    value={selectedItem} 
                    onChange={handleSelect}
                    className="mr-sm-2"
                    style={{ minWidth: '200px' }}
                  >
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </Form.Control>
                </Form>
              </Nav>
            </Container>
          </Navbar>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="p-4" style={{ backgroundColor: '#f8f9fa', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
            <h1>{items.find(item => item.id === parseInt(selectedItem))?.name}</h1>
            {selectedItem && (
              <div className="mt-4 d-flex flex-column">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                  id="fileUploadFIO"
                  onChange={(event) => { setUploadType('FIO'); handleFileUpload(event); }}
                />
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                  id="fileUploadApparat"
                  onChange={(event) => { setUploadType('APPARAT'); handleFileUpload(event); }}
                />
                <Button 
                  variant="light" 
                  className="mb-2 p-3" 
                  style={{ width: '100%', backgroundColor: '#e0e0e0', fontSize: '1.5rem' }} 
                  onClick={() => document.getElementById('fileUploadFIO').click()}
                >
                  Загрузить таблицу ФИО
                </Button>
                <Button 
                  variant="light" 
                  className="mb-2 p-3" 
                  style={{ width: '100%', backgroundColor: '#e0e0e0', fontSize: '1.5rem' }} 
                  onClick={() => document.getElementById('fileUploadApparat').click()}
                >
                  Загрузить таблицу Аппаратов
                </Button>
                <Button 
                  variant="light" 
                  className="p-3" 
                  style={{ width: '100%', backgroundColor: '#e0e0e0', fontSize: '1.5rem' }} 
                  onClick={handleLoadFioFromDB}
                >
                  Загрузить данные ФИО из БД
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={{ span: 8, offset: 2 }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>
                  date
                  <Button variant="link" onClick={handleSortByDate}>
                    Sort by Date
                  </Button>
                </th>
                <th>apparat name</th>
                <th>fio1</th>
                <th>fio2</th>
                <th>fio3</th>
                <th>fio4</th>
                <th>fio5</th>
                <th>tseh</th>
                <th>time</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} onContextMenu={(event) => handleRightClick(event, index)}>
                  <td>
                    <DatePicker
                      selected={row.date}
                      onChange={(date) => handleDateChange(date, index)}
                      dateFormat="yyyy-MM-dd"
                      className="form-control"
                    />
                  </td>
                  <td>
                    <Typeahead
                      id={`typeahead-${index}-apparatName`}
                      options={apparatOptions}
                      selected={row.apparatName ? [row.apparatName] : []}
                      onChange={(selected) => handleNameSelect(selected, index, 'apparatName')}
                      onInputChange={(text) => handleNameSelect([text], index, 'apparatName')}
                      paginate={false}
                      minLength={0}
                      placeholder="Select an apparat"
                    />
                  </td>
                  {['fio1', 'fio2', 'fio3', 'fio4', 'fio5'].map((col) => (
                    <td key={col}>
                      <Typeahead
                        id={`typeahead-${index}-${col}`}
                        options={nameOptions}
                        selected={row[col] ? [row[col]] : []}
                        onChange={(selected) => handleNameSelect(selected, index, col)}
                        onInputChange={(text) => handleNameSelect([text], index, col)}
                        paginate={false}
                        minLength={0}
                        placeholder="Ф.И.О."
                      />
                    </td>
                  ))}
                  <td>
                    <Form.Control
                      type="text"
                      value={row.tseh}
                      onChange={(e) => handleCellChange(e, index, 'tseh')}
                    />
                  </td>
                  <td>
                    <Button variant="link" onClick={() => handleNightToggle(index)}>
                      <FontAwesomeIcon icon={row.night ? faMoon : faSun} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="text-center mt-3">
            <Button 
              variant="light" 
              className="d-flex align-items-center justify-content-center rounded-circle" 
              style={{ width: '50px', height: '50px', backgroundColor: '#e0e0e0' }} 
              onClick={handleAddRow}
            >
              <FontAwesomeIcon icon={faPlus} />
              <div style={{ fontSize: '0.8rem' }}>E</div>
            </Button>
          </div>
        </Col>
      </Row>
      <div style={{ position: 'fixed', bottom: '10px', left: '10px' }}>
        <Button variant="dark" onClick={handleSaveTableData}>
          <FontAwesomeIcon icon={faSave} /> Сохранить
        </Button>
      </div>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Картировать колонны</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Выберите лист</Form.Label>
              <Form.Control
                as="select"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
              >
                {Object.keys(excelData).map((sheetName, index) => (
                  <option key={index} value={sheetName}>{sheetName}</option>
                ))}
              </Form.Control>
            </Form.Group>
            {selectedSheet && (
              <Form.Group>
                <Form.Label>Выберите колонну</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <option value="">Выбрать</option>
                  {excelData[selectedSheet][0].map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Закрыть
          </Button>
          <Button variant="primary" onClick={handleModalSave}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>
      {contextMenu.show && (
        <div
          style={{
            position: 'absolute',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: 'white',
            border: '1px solid black',
            padding: '10px',
            zIndex: 1000
          }}
        >
          <Button variant="danger" onClick={handleDeleteRow}>
            Удалить
          </Button>
        </div>
      )}
    </Container>
  );
}

export default App;
