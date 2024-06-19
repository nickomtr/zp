import React from 'react';
import { Container, Row, Col, Button, Form, Table, Modal } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import WorkplaceDugaHook from '../hooks/WorkplaceDugaHook';

function WorkplaceDetails({ selectedItem }) {
  const { 
    tableData, setTableData, nameOptions, setNameOptions, apparatOptions, setApparatOptions, 
    showModal, setShowModal, excelData, setExcelData, selectedSheet, setSelectedSheet, 
    selectedColumn, setSelectedColumn, uploadType, setUploadType, contextMenu, setContextMenu, 
    handleFileUpload, handleModalClose, handleModalSave, handleAddRow, handleNameSelect, 
    handleCellChange, handleDateChange, handleNightToggle, handleRightClick, handleDeleteRow, 
    handleSortByDate, handleLoadFioFromDB, handleSaveTableData, handleNameInputChange 
  } = WorkplaceDugaHook(selectedItem);

  return (
    <Container fluid>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="p-4" style={{ backgroundColor: '#f8f9fa', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
            <h1>{selectedItem}</h1>
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
                      onInputChange={(text) => handleNameInputChange(text, index, 'apparatName')}
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
                        onInputChange={(text) => handleNameInputChange(text, index, col)}
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

export default WorkplaceDetails;
