import './App.css';
import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CodeGenerator from './components/CodeGenerator.jsx';

let id = 1;
const createComponent = (type) => {
  return {
    id: id++,
    type,
    text: type === 'Text' ? 'Sample Text' : type === 'Button' ? 'Button' : '',
    placeholder: type === 'Input' ? 'Enter text...' : '',
    children: ['Column', 'Row'].includes(type) ? [] : null,
    properties: {
      fontSize: 14,
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#007bff',
      inputColor: '#ffffff',
      mainAxisAlignment: 'start',
      crossAxisAlignment: 'start',
    },
  };
};

// Alignment conversion function
const alignmentToFlex = (alignment) => {
  const map = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
    'space-around': 'space-around',
  };
  return map[alignment] || 'flex-start';
};

const DraggableComponent = ({ type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="component-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {type}
    </div>
  );
};

const ComponentRenderer = ({ component, parentId, moveComponent, deleteComponent, selectComponent, isSelected }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) return; // Prevent parent containers from handling drops

      if (['Column', 'Row'].includes(component.type)) {
        const newComponent = createComponent(item.type);
        moveComponent(component.id, newComponent);
      }
    },
    canDrop: (item) => ['Column', 'Row'].includes(component.type),
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }), // Only check immediate drop target
    }),
  }));

  const handleClick = (e) => {
    e.stopPropagation();
    selectComponent(component.id);
  };

  const renderContent = () => {
    const backgroundStyle = component.properties.backgroundColor
      ? { backgroundColor: component.properties.backgroundColor }
      : {};

    switch (component.type) {
      case 'Column':
      case 'Row':
        return (
          <div
            className={`container ${component.type.toLowerCase()}`}
            style={{
              ...backgroundStyle,
              borderColor: isOver ? 'blue' : '#ccc',
              minHeight: '100px',
              display: 'flex',
              flexDirection: component.type === 'Column' ? 'column' : 'row',
              justifyContent: alignmentToFlex(component.properties.mainAxisAlignment),
              alignItems: alignmentToFlex(component.properties.crossAxisAlignment),
            }}
            onClick={handleClick}
          >
            {component.children.length === 0 && (
              <div className="empty-message">Drop components here</div>
            )}
            {component.children.map((child) => (
              <ComponentRenderer
                key={child.id}
                component={child}
                parentId={component.id}
                moveComponent={moveComponent}
                deleteComponent={deleteComponent}
                selectComponent={selectComponent}
                isSelected={isSelected === child.id}
              />
            ))}
            {isSelected && (
              <button
                className="delete-button"
                onClick={() => deleteComponent(component.id)}
              >
                ×
              </button>
            )}
          </div>
        );
      case 'Text':
        return (
          <div
            className="text-component"
            style={{
              fontSize: `${component.properties.fontSize}px`,
              color: component.properties.textColor,
            }}
            onClick={handleClick}
          >
            {component.text}
            {isSelected && (
              <button
                className="delete-button"
                onClick={() => deleteComponent(component.id)}
              >
                ×
              </button>
            )}
          </div>
        );
      case 'Button':
        return (
          <button
            className="button-component"
            style={{
              backgroundColor: component.properties.buttonColor,
              color: 'white',
            }}
            onClick={handleClick}
          >
            {component.text}
            {isSelected && (
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteComponent(component.id);
                }}
              >
                ×
              </button>
            )}
          </button>
        );
      case 'Input':
        return (
          <div className="input-wrapper" onClick={handleClick}>
            <input
              className="input-component"
              placeholder={component.placeholder}
              style={{
                backgroundColor: component.properties.inputColor,
                color: component.properties.textColor,
                fontSize: `${component.properties.fontSize}px`,
              }}
            />
            {isSelected && (
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteComponent(component.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={drop} className="component-wrapper">
      {renderContent()}
    </div>
  );
};

const PhoneSurface = ({ components, moveComponent, deleteComponent, selectComponent, selectedComponent }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) return; // Prevent child containers from handling drops

      if (!['Column', 'Row'].includes(item.type)) {
        alert('Root elements must be Column or Row!');
        return;
      }
      const newComponent = createComponent(item.type);
      moveComponent(null, newComponent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }), // Only check immediate drop target
    }),
  }));

  return (
    <div
      ref={drop}
      className="phone-surface"
      style={{ borderColor: isOver ? 'blue' : '#ccc' }}
    >
      {components.map((component) => (
        <ComponentRenderer
          key={component.id}
          component={component}
          parentId={null}
          moveComponent={moveComponent}
          deleteComponent={deleteComponent}
          selectComponent={selectComponent}
          isSelected={selectedComponent === component.id}
        />
      ))}
    </div>
  );
};

const PropertiesPanel = ({ component, updateComponent }) => {
  const [localState, setLocalState] = useState(component?.properties || {});

  const handleChange = (property, value) => {
    const newState = { ...localState, [property]: value };
    setLocalState(newState);
    updateComponent(component.id, newState);
  };

  const handleTextChange = (e) => {
    component.text = e.target.value;
    updateComponent(component.id, component.properties);
  };

  const handlePlaceholderChange = (e) => {
    component.placeholder = e.target.value;
    updateComponent(component.id, component.properties);
  };

  if (!component) return <div className="properties-panel">Select a component to edit properties</div>;

  return (
    <div className="properties-panel">
      <h3>Properties</h3>
      {component.type === 'Text' && (
        <>
          <label>
            Text Content:
            <input
              type="text"
              value={component.text}
              onChange={handleTextChange}
            />
          </label>
          <label>
            Font Size:
            <input
              type="number"
              value={localState.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            />
          </label>
          <label>
            Text Color:
            <input
              type="color"
              value={localState.textColor}
              onChange={(e) => handleChange('textColor', e.target.value)}
            />
          </label>
        </>
      )}
      {component.type === 'Input' && (
        <>
          <label>
            Placeholder:
            <input
              type="text"
              value={component.placeholder}
              onChange={handlePlaceholderChange}
            />
          </label>
          <label>
            Input Color:
            <input
              type="color"
              value={localState.inputColor}
              onChange={(e) => handleChange('inputColor', e.target.value)}
            />
          </label>
        </>
      )}
      {['Column', 'Row'].includes(component.type) && (
        <>
          <label>
            Background Color:
            <input
              type="color"
              value={localState.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
            />
          </label>
          <label>
            Main Axis Alignment:
            <select
              value={localState.mainAxisAlignment}
              onChange={(e) => handleChange('mainAxisAlignment', e.target.value)}
            >
              {['start', 'center', 'end', 'space-between', 'space-around'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cross Axis Alignment:
            <select
              value={localState.crossAxisAlignment}
              onChange={(e) => handleChange('crossAxisAlignment', e.target.value)}
            >
              {['start', 'center', 'end'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      {component.type === 'Button' && (
        <>
          <label>
            Button Color:
            <input
              type="color"
              value={localState.buttonColor}
              onChange={(e) => handleChange('buttonColor', e.target.value)}
            />
          </label>
        </>
      )}
    </div>
  );
};

const App = () => {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const findComponent = (items, id, parent = null) => {
    for (const item of items) {
      if (item.id === id) return { item, parent };
      if (item.children) {
        const found = findComponent(item.children, id, item);
        if (found) return found;
      }
    }
    return null;
  };

  const deleteComponent = (id) => {
    setComponents((prev) => {
      const result = findComponent(prev, id);
      if (!result) return prev;

      const newComponents = [...prev];
      if (!result.parent) {
        return newComponents.filter((c) => c.id !== id);
      }

      result.parent.children = result.parent.children.filter((c) => c.id !== id);
      return JSON.parse(JSON.stringify(newComponents));
    });
    setSelectedComponent(null);
  };

  const updateComponent = (id, newProperties) => {
    setComponents((prev) => {
      const result = findComponent(prev, id);
      if (!result) return prev;

      const updated = JSON.parse(JSON.stringify(prev));
      const target = findComponent(updated, id).item;
      target.properties = { ...target.properties, ...newProperties };
      return updated;
    });
  };

  const moveComponent = (parentId, component) => {
    setComponents((prev) => {
      const newItems = JSON.parse(JSON.stringify(prev));
      if (parentId === null) {
        if (!newItems.some((c) => c.id === component.id)) {
          newItems.push(component);
        }
        return newItems;
      }

      const parent = findComponent(newItems, parentId)?.item;
      if (parent && parent.children) {
        if (!parent.children.some((c) => c.id === component.id)) {
          parent.children.push(component);
        }
      }
      return newItems;
    });
  };

  return (
    <DndProvider className="container" backend={HTML5Backend}>
      <div className="app">
        {/* App Bar */}
        <div className="app-bar">
          <h1>FlutterFlow Clone</h1>
          <div className="app-bar-actions">
            <button className="export-button">Export Project</button>
            <button className="preview-button">Preview</button>
          </div>
        </div>

        <div className="main-content">
          <div className="components-panel">
            <h3>UI Components</h3>
            <div className="components-grid">
              <DraggableComponent type="Text" />
              <DraggableComponent type="Button" />
              <DraggableComponent type="Input" />
              <DraggableComponent type="Column" />
              <DraggableComponent type="Row" />
            </div>
          </div>

          <div className="workspace">
            <PhoneSurface
              components={components}
              moveComponent={moveComponent}
              deleteComponent={deleteComponent}
              selectComponent={setSelectedComponent}
              selectedComponent={selectedComponent}
            />
            <div className="right-panel">
              <PropertiesPanel
                component={findComponent(components, selectedComponent)?.item}
                updateComponent={updateComponent}
              />
              <CodeGenerator components={components} />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default App;