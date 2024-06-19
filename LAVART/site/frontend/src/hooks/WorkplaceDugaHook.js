import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

function WorkplaceDugaHook(selectedItem) {
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
    setTableData([]);
    setNameOptions([]);
    setApparatOptions([]);
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
  }, [selectedItem]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveTableData();
    }, 60000);

    return () => clearInterval(interval);
  }, [tableData]);

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
    if (!selected || selected.length === 0) {
      return;
    }

    const newData = [...tableData];
    newData[index][colName] = selected[0];
    setTableData(newData);
  };

  const handleCellChange = (event, index, colName) => {
    console.log(event.target.value);
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

  const handleDeleteRow = async () => {
    const rowToDelete = tableData[contextMenu.rowIndex];
    try {
      await axios.delete(`http://localhost:8000/delete_table_data/${rowToDelete.id}`);
      const newData = tableData.filter((_, i) => i !== contextMenu.rowIndex);
      setTableData(newData);
      setContextMenu({ show: false, x: 0, y: 0, rowIndex: null });
      toast.success('Строчка удалена успешно!');
    } catch (error) {
      console.error('Ошибка при удалении строки!', error);
      toast.error('Error deleting row!');
    }
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

  const handleNameInputChange = useCallback((text, index, colName) => {
    const newData = [...tableData];
    newData[index][colName] = text;
    setTableData(newData);
  }, [tableData]);

  return {
    tableData, setTableData, nameOptions, setNameOptions, apparatOptions, setApparatOptions,
    showModal, setShowModal, excelData, setExcelData, selectedSheet, setSelectedSheet,
    selectedColumn, setSelectedColumn, uploadType, setUploadType, contextMenu, setContextMenu,
    handleFileUpload, handleModalClose, handleModalSave, handleAddRow, handleNameSelect,
    handleCellChange, handleDateChange, handleNightToggle, handleRightClick, handleDeleteRow,
    handleSortByDate, handleLoadFioFromDB, handleSaveTableData, handleNameInputChange
  };
}

export default WorkplaceDugaHook;
