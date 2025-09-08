import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { getAuthFromStorage } from "../utils/auth";
import { X, Save, Trash2, Settings, Tag, Clock, Type, Plus, Minus, User, Package } from "lucide-react";

const PropertiesPanel = ({ selectedNode, onNodeUpdate, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [events, setEvents] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [event, setEvent] = useState({});
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [productEmployeeMappings, setProductEmployeeMappings] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [editingMappingId, setEditingMappingId] = useState(null);

  const onNodeDelete = () => {
    if (selectedNode && window.confirm(`Are you sure you want to delete this ${selectedNode.type} node?`)) {
      window.dispatchEvent(new CustomEvent('deleteNode', { detail: selectedNode.id }));
      onClose();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedNode) {
      setSelectedTask(selectedNode.data.selectedTask || null);
      setSelectedGateway(selectedNode.data.selectedGateway || null);
      setEvent(selectedNode.data.event || {});
      setProductEmployeeMappings(selectedNode.data.productEmployeeMappings || []);
    }
  }, [selectedNode]);

  const fetchData = async () => {
    try {
      const auth = getAuthFromStorage();
      console.log('Fetching node data with auth:', auth);
      
      if (!auth.accessToken) {
        console.error('No authentication token available for fetching node data');
        return;
      }
      
      const [nodeDetails, conditionsData, productsData, employeesData] = await Promise.all([
        api.getNodeDetails(),
        api.getAllConditions(),
        api.getProductList(),
        api.getEmployeeList(),
      ]);

      console.log('Fetched node details:', nodeDetails);
      console.log('Fetched conditions:', conditionsData);
      console.log('Fetched products:', productsData);
      console.log('Fetched employees:', employeesData);

      setTasks(nodeDetails.tasks || []);
      setGateways(nodeDetails.gateways || []);
      setEvents(nodeDetails.events || []);
      setConditions(conditionsData || []);
      setProducts(productsData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set empty arrays on error to prevent UI issues
      setTasks([]);
      setGateways([]);
      setEvents([]);
      setConditions([]);
      setProducts([]);
      setEmployees([]);
    }
  };

  const handleSave = () => {
    if (!selectedNode) return;

    const updatedData = {
      ...selectedNode.data,
      selectedTask,
      selectedGateway,
      event,
      productEmployeeMappings,
    };

    onNodeUpdate(selectedNode.id, updatedData);
  };

  const handleFieldChange = (key, value) => {
    setEvent((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addProductEmployeeMapping = () => {
    setProductEmployeeMappings(prev => [
      ...prev,
      { id: Date.now(), productId: '', employeeId: '', productName: '', employeeName: '' }
    ]);
  };

  const removeProductEmployeeMapping = (id) => {
    setProductEmployeeMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  const updateProductEmployeeMapping = (id, field, value) => {
    setProductEmployeeMappings(prev => prev.map(mapping => {
      if (mapping.id === id) {
        const updated = { ...mapping, [field]: value };
        
        // Auto-populate names when IDs are selected
        if (field === 'productId') {
          const product = products.find(p => p.productID.toString() === value);
          updated.productName = product ? product.productname : '';
          updated.productAmount = product ? product.amount : '';
        }
        if (field === 'employeeId') {
          const employee = employees.find(e => e.emp_id === value);
          updated.employeeName = employee ? employee.full_name : '';
        }
        
        return updated;
      }
      return mapping;
    }));
  };

  const handleAddMapping = () => {
    if (!selectedProductId || !selectedEmployeeId) return;

    const product = products.find(p => p.productID.toString() === selectedProductId);
    const employee = employees.find(e => e.emp_id === selectedEmployeeId);

    if (!product || !employee) return;

    // Check if mapping already exists
    const existingMapping = productEmployeeMappings.find(
      mapping => mapping.productId === selectedProductId && mapping.employeeId === selectedEmployeeId
    );

    if (existingMapping) {
      alert('This product-employee mapping already exists!');
      return;
    }

    const newMapping = {
      id: Date.now(),
      productId: selectedProductId,
      employeeId: selectedEmployeeId,
      productName: product.productname,
      productAmount: product.amount,
      employeeName: employee.full_name
    };

    setProductEmployeeMappings(prev => [...prev, newMapping]);
    
    // Clear selections
    setSelectedProductId('');
    setSelectedEmployeeId('');
  };

  const handleEditMapping = (mappingId) => {
    const mapping = productEmployeeMappings.find(m => m.id === mappingId);
    if (mapping) {
      setSelectedProductId(mapping.productId);
      setSelectedEmployeeId(mapping.employeeId);
      setEditingMappingId(mappingId);
      
      // Remove the mapping being edited
      setProductEmployeeMappings(prev => prev.filter(m => m.id !== mappingId));
    }
  };

  const handleDeleteMapping = (mappingId) => {
    if (window.confirm('Are you sure you want to delete this mapping?')) {
      setProductEmployeeMappings(prev => prev.filter(mapping => mapping.id !== mappingId));
    }
  };
  const isAssignLeadTask = selectedTask?.name === 'Assign Lead' && selectedTask?.type === 'ServiceTask';

  if (!selectedNode) return null;

  return (
    <>
      <div className="w-96 bg-white border-l-2 border-slate-300 shadow-lg overflow-y-auto relative">
        {/* Header */}
        <div className="p-6 border-b-2 border-slate-300 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 border-2 border-indigo-700 flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Properties</h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <p className="text-sm text-slate-600">Configure node settings and behavior</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Node Type */}
          <div className="p-4 bg-slate-50 border-2 border-slate-300">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-slate-600" />
              <label className="text-sm font-semibold text-slate-700">Node Type</label>
            </div>
            <div className="px-3 py-2 bg-white text-sm font-medium text-slate-800 border-2 border-slate-300">
              {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Node
            </div>
          </div>

          {/* Product-Employee Mapping Section - Only for Assign Lead Task */}
          {isAssignLeadTask && (
            <div className="pt-6 border-t-2 border-slate-300 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Product-Employee Assignment
                </h4>
              </div>

              {/* Dropdowns and Add Button */}
              <div className="space-y-3 p-4 bg-slate-50 border-2 border-slate-300">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <Package className="w-3 h-3 inline mr-1" />
                      Select Product
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="">Choose Product...</option>
                      {products.map((product) => (
                        <option key={product.productID} value={product.productID}>
                          {product.productname} (₹{product.amount})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <User className="w-3 h-3 inline mr-1" />
                      Select Employee
                    </label>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="">Choose Employee...</option>
                      {employees.map((employee) => (
                        <option key={employee.emp_id} value={employee.emp_id}>
                          {employee.full_name} ({employee.emp_id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAddMapping}
                  disabled={!selectedProductId || !selectedEmployeeId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white border-2 border-purple-700 hover:bg-purple-700 disabled:bg-slate-400 disabled:border-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm"
                >
                  <Check className="w-4 h-4" />
                  Add Mapping
                </button>
              </div>

              {/* Mappings Table */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Current Mappings ({productEmployeeMappings.length})
                </h5>
                
                {productEmployeeMappings.length > 0 ? (
                  <div className="border-2 border-slate-300 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 border-b-2 border-slate-300">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Product</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Employee</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productEmployeeMappings.map((mapping, index) => (
                          <tr key={mapping.id} className={`border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <td className="px-3 py-2">
                              <div className="font-medium text-slate-800">{mapping.productName}</div>
                              <div className="text-slate-500">₹{mapping.productAmount} (ID: {mapping.productId})</div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="font-medium text-slate-800">{mapping.employeeName}</div>
                              <div className="text-slate-500">ID: {mapping.employeeId}</div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleEditMapping(mapping.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 border border-blue-300 transition-colors"
                                  title="Edit mapping"
                                >
                                  <Settings className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMapping(mapping.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 border border-red-300 transition-colors"
                                  title="Delete mapping"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 border-2 border-slate-300 bg-slate-50">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No product-employee mappings</p>
                    <p className="text-xs">Select product and employee above to add mapping</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Task Configuration */}
          {selectedNode.type === "task" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Task Configuration</h4>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Task
                </label>
                <select
                  value={selectedTask?.key || ""}
                  onChange={(e) => {
                    const task = tasks.find((t) => t.key === e.target.value);
                    setSelectedTask(task || null);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select a task...</option>
                  {tasks.map((task) => (
                    <option key={task.key} value={task.key}>
                      {task.name} ({task.type})
                    </option>
                  ))}
                </select>
                {selectedTask && (
                  <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-300">
                    <div className="text-sm">
                      <div className="font-medium text-blue-900 mb-1">Selected Task</div>
                      <div className="text-blue-700">{selectedTask.name}</div>
                      <div className="text-xs text-blue-600 mt-1">Type: {selectedTask.type}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product-Employee Mapping for Assign Lead Task */}
              {isAssignLeadTask && (
                <div className="space-y-4 mt-6 pt-6 border-t-2 border-slate-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Product-Employee Mapping
                      </h4>
                    </div>
                    <button
                      onClick={addProductEmployeeMapping}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700 transition-colors duration-200 text-xs"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {productEmployeeMappings.map((mapping) => (
                      <div key={mapping.id} className="p-3 bg-slate-50 border-2 border-slate-300 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-600">Mapping #{mapping.id}</span>
                          <button
                            onClick={() => removeProductEmployeeMapping(mapping.id)}
                            className="p-1 text-red-600 hover:bg-red-100 border border-red-300 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              <Package className="w-3 h-3 inline mr-1" />
                              Product
                            </label>
                            <select
                              value={mapping.productId}
                              onChange={(e) => updateProductEmployeeMapping(mapping.id, 'productId', e.target.value)}
                              className="w-full px-2 py-2 text-xs border-2 border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                              <option value="">Select Product...</option>
                              {products.map((product) => (
                                <option key={product.productID} value={product.productID}>
                                  {product.productname} (₹{product.amount})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              <User className="w-3 h-3 inline mr-1" />
                              Employee
                            </label>
                            <select
                              value={mapping.employeeId}
                              onChange={(e) => updateProductEmployeeMapping(mapping.id, 'employeeId', e.target.value)}
                              className="w-full px-2 py-2 text-xs border-2 border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                              <option value="">Select Employee...</option>
                              {employees.map((employee) => (
                                <option key={employee.emp_id} value={employee.emp_id}>
                                  {employee.full_name} ({employee.emp_id})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        {mapping.productName && mapping.employeeName && (
                          <div className="p-2 bg-blue-50 border-2 border-blue-300">
                            <div className="text-xs">
                              <div className="font-medium text-blue-900">Selected Mapping:</div>
                              <div className="text-blue-700">
                                {mapping.productName} → {mapping.employeeName}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {productEmployeeMappings.length === 0 && (
                      <div className="text-center py-6 text-slate-500">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No product-employee mappings</p>
                        <p className="text-xs">Click "Add" to create a mapping</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gateway Configuration */}
          {selectedNode.type === "gateway" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-orange-600" />
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Gateway Configuration</h4>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Gateway
                </label>
                <select
                  value={selectedGateway?.key || ""}
                  onChange={(e) => {
                    const gateway = gateways.find((g) => g.key === e.target.value);
                    setSelectedGateway(gateway || null);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="">Select a gateway...</option>
                  {gateways.map((gateway) => (
                    <option key={gateway.key} value={gateway.key}>
                      {gateway.name} ({gateway.type})
                    </option>
                  ))}
                </select>
                {selectedGateway && (
                  <div className="mt-3 p-3 bg-orange-50 border-2 border-orange-300">
                    <div className="text-sm">
                      <div className="font-medium text-orange-900 mb-1">Selected Gateway</div>
                      <div className="text-orange-700">{selectedGateway.name}</div>
                      <div className="text-xs text-orange-600 mt-1">Type: {selectedGateway.type}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Configuration */}
          {selectedNode.type === "event" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Event Configuration</h4>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Event Type
                </label>
                <select
                  value={event?.key || ""}
                  onChange={(e) => {
                    const selected = events.find((g) => g.key === e.target.value);
                    setEvent(selected || {});
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="">Select an event...</option>
                  {events.map((ev) => (
                    <option key={ev.key} value={ev.key}>
                      {ev.name} ({ev.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={event.eventName || ""}
                  onChange={(e) => handleFieldChange("eventName", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter event name..."
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <label className="block text-sm font-semibold text-slate-700">
                    Time Duration
                  </label>
                </div>
                <input
                  type="text"
                  value={event.timeDuration || ""}
                  onChange={(e) => handleFieldChange("timeDuration", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="e.g., PT1M, PT5S, PT1H"
                />
                <div className="mt-2 text-xs text-slate-500">
                  Use ISO 8601 duration format (PT1M = 1 minute, PT5S = 5 seconds)
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t-2 border-slate-300 space-y-3">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>

            <button
              onClick={onNodeDelete}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Delete Node
            </button>
          </div>
        </div>
      </div>

      {/* Condition Modal Overlay */}
      {showConditionModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="bg-black bg-opacity-30 absolute inset-0"
            onClick={() => setShowConditionModal(false)}
          />
          <div className="relative w-96 h-full bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Condition Modal</h4>
              <button
                onClick={() => setShowConditionModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-gray-700">
                This is the Condition Modal. Add your condition form or content here.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertiesPanel;