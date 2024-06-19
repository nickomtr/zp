import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Navbar, Nav, Form } from 'react-bootstrap';
import WorkplaceDuga from './components/WorkplaceDuga';
import WorkplaceZU from './components/WorkplaceZU';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');

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

  const handleSelect = (event) => {
    setSelectedItem(event.target.value);
  };

  const selectedWorkplace = items.find(item => item.id === parseInt(selectedItem));

  const renderWorkplaceComponent = () => {
    if (selectedWorkplace) {
      switch (selectedWorkplace.name) {
        case "Рабочее место 'Дуга'":
          return <WorkplaceDuga key={selectedWorkplace.id} selectedItem={selectedWorkplace.name} />;
        case "Рабочее место 'Заг.участок'":
          return <WorkplaceZU key={selectedWorkplace.id} selectedItem={selectedWorkplace.name} />;
        default:
          return null;
      }
    }
    return null;
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
      {renderWorkplaceComponent()}
    </Container>
  );
}

export default App
