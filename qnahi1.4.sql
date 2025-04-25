--use master;
--drop DATABASE QNahiDB;
--create database QNahiDB;
use QNahiDB;
GO

---- 1. Students table
--CREATE TABLE Students (
--    Roll_No INT IDENTITY(1,1) PRIMARY KEY,
--    Email VARCHAR(255) UNIQUE NOT NULL,
--    Name VARCHAR(100) NOT NULL,
--    Password VARCHAR(255) NOT NULL,
--    Active BIT DEFAULT 1
--);

---- 2. Grounds table
--CREATE TABLE Grounds (
--    G_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Ground_Type VARCHAR(50) NOT NULL,
--    Mgr_ID INT,
--    G_Status VARCHAR(20) CHECK (G_Status IN ('Available', 'Booked', 'Maintenance'))
--);

---- 3. Booking table
--CREATE TABLE Booking (
--    Booking_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Roll_No INT,
--    G_ID INT NOT NULL,
--    B_Time DATETIME NOT NULL,
--    Slot VARCHAR(20) NOT NULL
--);

---- 4. Restaurants table
--CREATE TABLE Restaurants (
--    Restaurant_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Restaurant_Name VARCHAR(100) NOT NULL,
--    Mgr_ID INT,
--    Email VARCHAR(255) UNIQUE NOT NULL,
--    Phone VARCHAR(20) NOT NULL,
--    Location VARCHAR(255) NOT NULL,
--    Restaurant_Status VARCHAR(20) CHECK (Restaurant_Status IN ('Open', 'Closed'))
--);

---- 5. Menu table
--CREATE TABLE Menu (
--    Item_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Item_Name VARCHAR(100) NOT NULL,
--    Item_Amount DECIMAL(10,2) NOT NULL,
--    Restaurant_ID INT NOT NULL,
--    Description NVARCHAR(MAX),
--    Stock INT DEFAULT 0,
--	Picture Text
--);

---- 6. Food_Orders table
--CREATE TABLE Food_Orders (
--    FOrder_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Roll_No INT,
--    Restaurant_ID INT,
--    Food_Status VARCHAR(50) CHECK (Food_Status IN ('Pending', 'Preparing', 'Ready', 'Completed')),
--    Pickup_Time DATETIME,
--    Order_Time DATETIME,
--    Amount_Total DECIMAL(10,2) NOT NULL
--);

---- 7. Food_Order_Items table
--CREATE TABLE Food_Order_Items (
--    FOrder_ID INT NOT NULL,
--    Item_ID INT,
--    Quantity INT NOT NULL,
--    PRIMARY KEY (FOrder_ID, Item_ID)
--);	

---- 8. Photocopier table
--CREATE TABLE Photocopier (
--    Photocopier_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Roll_No INT,
--    Service_Type VARCHAR(20) CHECK (Service_Type IN ('Print', 'Book')),
--    Mgr_ID INT,
--    Total_Amount DECIMAL(10,2) NOT NULL,
--    Photocopier_Status VARCHAR(20) CHECK (Photocopier_Status IN ('Open', 'Closed'))
--);

---- 9. Print_Jobs table
--CREATE TABLE Print_Jobs (
--    Print_Job_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Type_ID INT NOT NULL,
--    Photocopier_ID INT NULL,
--    Doc_Info NVARCHAR(MAX) NOT NULL,
--    No_Pages INT NOT NULL
--);

---- 10. Print_Types table
--CREATE TABLE Print_Types (
--    Type_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Type_Name VARCHAR(50) NOT NULL
--);

---- 11. Print_Type_Pricing table
--CREATE TABLE Print_Type_Pricing (
--    Type_ID INT NOT NULL,
--    Price_Per_Page DECIMAL(10,2) NOT NULL,
--    PRIMARY KEY (Type_ID)
--);

---- 12. Books table
--CREATE TABLE Books (
--    Book_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Book_Name VARCHAR(100) NOT NULL,
--    Book_Amount DECIMAL(10,2) NOT NULL,
--	  Stock DECIMAL(10, 2) NOT NULL
--);

---- 13. Book_Orders table
--CREATE TABLE Book_Orders (
--    BOrder_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Amount_Total DECIMAL(10,2) NOT NULL,
--    Order_Time DATETIME,
--    Photocopier_ID INT
--);

---- 14. Book_Order_Items table
--CREATE TABLE Book_Order_Items (
--    BOrder_ID INT NOT NULL,
--    Book_ID INT NOT NULL,
--    Quantity INT NOT NULL,
--    PRIMARY KEY (BOrder_ID, Book_ID)
--);

---- 15. Type_Service table
--CREATE TABLE Type_Service (
--    Type_Service_ID INT PRIMARY KEY IDENTITY(1,1),
--    Type_Service VARCHAR(50) NOT NULL CHECK (Type_Service IN ('Restaurant', 'Ground', 'Photocopier')),
--    Service_PK INT NOT NULL
--);

---- 16. Payments table
--CREATE TABLE Payments (
--    Payment_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Type_Service_ID INT NOT NULL,
--    Order_ID INT NOT NULL,
--    Roll_No INT NOT NULL,
--    Amount_Total DECIMAL(10,2) NOT NULL,
--    Payment_Type VARCHAR(20) CHECK (Payment_Type IN ('Cash', 'Card')),
--    Status VARCHAR(20) CHECK (Status IN ('Paid', 'Unpaid'))
--);

---- 17. Managers table
--CREATE TABLE Managers (
--    Mgr_ID INT IDENTITY(1,1) PRIMARY KEY,
--    Name VARCHAR(255) NOT NULL,
--    Email VARCHAR(255) UNIQUE,
--    Password VARCHAR(255) NOT NULL
--);

---- 18. Manager_Access table
--CREATE TABLE Manager_Access (
--    Mgr_ID INT NOT NULL,
--    Type_Service_ID INT NOT NULL,
--    PRIMARY KEY (Mgr_ID, Type_Service_ID)
--);

---- 19. Operational_Timings table
--CREATE TABLE Operational_Timings (
--    Type_Service_ID INT NOT NULL,
--    Opening_Time TIME NOT NULL,
--    Closing_Time TIME NOT NULL,
--    PRIMARY KEY (Type_Service_ID)
--);

---- 20. Admin Table
--CREATE TABLE Admin (
--	Admin_ID INT IDENTITY(1,1) PRIMARY KEY,
--	Email VARCHAR(255) UNIQUE NOT NULL,
--	Password VARCHAR(255) NOT NULL
--);


----Foreign Key Constraints
-- --Student-related constraints
--ALTER TABLE Booking ADD CONSTRAINT fk_booking_students FOREIGN KEY (Roll_No) REFERENCES Students(Roll_No) ON UPDATE CASCADE ON DELETE CASCADE;
--ALTER TABLE Food_Orders ADD CONSTRAINT fk_food_orders_students FOREIGN KEY (Roll_No) REFERENCES Students(Roll_No) ON UPDATE CASCADE ON DELETE SET NULL;
--ALTER TABLE Photocopier ADD CONSTRAINT fk_photocopier_students FOREIGN KEY (Roll_No) REFERENCES Students(Roll_No) ON UPDATE CASCADE ON DELETE SET NULL;
--ALTER TABLE Payments ADD CONSTRAINT fk_payments_students FOREIGN KEY (Roll_No) REFERENCES Students(Roll_No);

---- Grounds-related constraints
--ALTER TABLE Booking ADD CONSTRAINT fk_booking_grounds FOREIGN KEY (G_ID) REFERENCES Grounds(G_ID) ON UPDATE CASCADE ON DELETE CASCADE;

---- Restaurant-related constraints
--ALTER TABLE Menu ADD CONSTRAINT fk_menu_restaurants FOREIGN KEY (Restaurant_ID) REFERENCES Restaurants(Restaurant_ID) ON UPDATE CASCADE ON DELETE CASCADE;
--ALTER TABLE Food_Orders ADD CONSTRAINT fk_food_orders_restaurants FOREIGN KEY (Restaurant_ID) REFERENCES Restaurants(Restaurant_ID) ON UPDATE CASCADE ON DELETE SET NULL;

---- Order items constraints
--ALTER TABLE Food_Order_Items ADD CONSTRAINT fk_food_order_items_orders FOREIGN KEY (FOrder_ID) REFERENCES Food_Orders(FOrder_ID);
--ALTER TABLE Food_Order_Items ADD CONSTRAINT fk_food_order_items_menu FOREIGN KEY (Item_ID) REFERENCES Menu(Item_ID) ON UPDATE CASCADE ON DELETE CASCADE;
--ALTER TABLE Book_Order_Items ADD CONSTRAINT fk_book_order_items_orders FOREIGN KEY (BOrder_ID) REFERENCES Book_Orders(BOrder_ID);
--ALTER TABLE Book_Order_Items ADD CONSTRAINT fk_book_order_items_books FOREIGN KEY (Book_ID) REFERENCES Books(Book_ID);

---- Print shop constraints
--ALTER TABLE Print_Jobs ADD CONSTRAINT fk_print_jobs_types FOREIGN KEY (Type_ID) REFERENCES Print_Types(Type_ID);
--ALTER TABLE Print_Type_Pricing ADD CONSTRAINT fk_print_type_pricing_types FOREIGN KEY (Type_ID) REFERENCES Print_Types(Type_ID);

--ALTER TABLE Payments ADD CONSTRAINT fk_payments_type_service FOREIGN KEY (Type_Service_ID) REFERENCES Type_Service(Type_Service_ID);
--ALTER TABLE Manager_Access ADD CONSTRAINT fk_manager_access_type_service FOREIGN KEY (Type_Service_ID) REFERENCES Type_Service(Type_Service_ID);
--ALTER TABLE Operational_Timings ADD CONSTRAINT fk_timings_type_service FOREIGN KEY (Type_Service_ID) REFERENCES Type_Service(Type_Service_ID);

---- Add foreign key constraints for Manager connections
--Alter Table Manager_Access ADD CONSTRAINT fk_manager_manager_access FOREIGN KEY (Mgr_ID) REFERENCES Managers(Mgr_ID) ON UPDATE CASCADE ON DELETE CASCADE;
--ALTER TABLE Photocopier ADD CONSTRAINT fk_photocopier_manager FOREIGN KEY (Mgr_ID) REFERENCES Managers(Mgr_ID) ;
--ALTER TABLE Restaurants ADD CONSTRAINT fk_restaurants_manager FOREIGN KEY (Mgr_ID) REFERENCES Managers(Mgr_ID);
--ALTER TABLE Grounds ADD CONSTRAINT fk_grounds_manager FOREIGN KEY (Mgr_ID) REFERENCES Managers(Mgr_ID);	

---- Add foreign key constraints for Photocopier connections
--ALTER TABLE Print_Jobs ADD CONSTRAINT fk_print_jobs_photocopier FOREIGN KEY (Photocopier_ID) REFERENCES Photocopier(Photocopier_ID) ON UPDATE CASCADE ON DELETE SET NULL;
--ALTER TABLE Book_Orders ADD CONSTRAINT fk_book_orders_photocopier FOREIGN KEY (Photocopier_ID) REFERENCES Photocopier(Photocopier_ID) ON UPDATE CASCADE ON DELETE SET NULL;

-- -- Views
--CREATE VIEW PrintPricingView AS
--SELECT 
--    pt.Type_ID,
--    pt.Type_Name,
--    ptp.Price_Per_Page
--FROM Print_Types pt
--JOIN Print_Type_Pricing ptp ON pt.Type_ID = ptp.Type_ID;
--GO

---- check for student login
--CREATE PROCEDURE StudentLogin
--   @Email VARCHAR(50),
--   @Password VARCHAR(100)
-- AS
-- BEGIN
--   SELECT * FROM Students
--   WHERE Email = @Email AND Password = @Password
-- END;
-- GO

--CREATE PROCEDURE SignupStudent
--  @Email VARCHAR(255),
--  @Name VARCHAR(100),
--  @Password VARCHAR(255)
--AS
--BEGIN
--  -- Check if email already exists
--  IF EXISTS (SELECT 1 FROM Students WHERE Email = @Email)
--  BEGIN
--    RAISERROR('Email already registered', 16, 1)
--    RETURN
--  END 

--  -- Insert new student
--  INSERT INTO Students (Email, Name, Password)
--  VALUES (@Email, @Name, @Password)
--END;
--GO

--CREATE PROCEDURE ManagerLogin
--   @Email VARCHAR(50),
--   @Password VARCHAR(100)
-- AS
-- BEGIN
--   SELECT * FROM Managers
--   WHERE Email = @Email AND Password = @Password
-- END;
-- GO


--CREATE PROCEDURE SignupManager
--  @Email VARCHAR(255),
--  @Name VARCHAR(100),
--  @Password VARCHAR(255)
--AS
--BEGIN
--  -- Check if email already exists
--  IF EXISTS (SELECT 1 FROM Managers WHERE Email = @Email)
--  BEGIN
--    RAISERROR('Email already registered', 16, 1)
--    RETURN
--  END

--  -- Insert new manager
--  INSERT INTO Managers (Email, Name, Password)
--  VALUES (@Email, @Name, @Password)
--END;
--GO

----Admin
--INSERT INTO Admin (Email, Password) VALUES
--('admin@uni', 'pass');
--GO

---- Default Photocopier
--INSERT INTO Type_Service (Type_Service, Service_PK)
--VALUES ('Photocopier', 1);
--GO

--INSERT INTO Managers (Email, Name, Password) VALUES
--('ground@uni', 'Ali', 'groundM'),
--('photocopi@uni', 'Ahmed', 'photoM');
--GO

--INSERT INTO Manager_Access (Mgr_ID, Type_Service_ID)
--VALUES (
--    (SELECT Mgr_ID FROM Managers WHERE Email = 'photocopi@uni'),
--    (SELECT Type_Service_ID FROM Type_Service WHERE Service_PK = 1 AND Type_Service = 'Photocopier')
--);
--GO

--INSERT INTO Operational_Timings (Type_Service_ID, Opening_Time, Closing_Time)
--VALUES (
--    (SELECT Type_Service_ID FROM Type_Service WHERE Service_PK = 1 AND Type_Service = 'Photocopier'),
--    '09:00',
--    '17:00'
--);
--GO

---- for ground manager login
--INSERT INTO Grounds (Ground_Type, Mgr_ID, G_Status) VALUES
--('Cricket', (Select Mgr_ID from Managers where Email = 'ground@uni'), 'Maintenance');
--GO

--CREATE TRIGGER trg_insert_operational_timings
--ON Type_Service
--AFTER INSERT
--AS
--BEGIN
--    INSERT INTO Operational_Timings (Type_Service_ID, Opening_Time, Closing_Time)
--    SELECT i.Type_Service_ID, '08:00:00', '17:00:00'  -- or any default timing
--    FROM inserted i;
--END;
--GO

--CREATE TRIGGER trg_insert_type_service_restaurant
--ON Restaurants
--AFTER INSERT
--AS
--BEGIN
--    INSERT INTO Type_Service (Service_PK, Type_Service)
--    SELECT R.Restaurant_ID, 'Restaurant'
--    FROM inserted R;
--END;
--GO

--CREATE TRIGGER trg_insert_type_service_ground
--ON Grounds
--AFTER INSERT
--AS
--BEGIN
--    INSERT INTO Type_Service (Service_PK, Type_Service)
--    SELECT G.G_ID, 'Ground'
--    FROM inserted G;
--END;
--GO

--CREATE TRIGGER trg_insert_manager_access_restaurant
--ON Restaurants
--AFTER INSERT
--AS
--BEGIN
--    -- Check if the combination already exists in Manager_Access
--    IF NOT EXISTS (
--        SELECT 1
--        FROM Manager_Access MA
--        JOIN inserted R ON MA.Mgr_ID = R.Mgr_ID
--        JOIN Type_Service TS ON TS.Service_PK = R.Restaurant_ID 
--        WHERE TS.Type_Service = 'Restaurant'
--    )
--    BEGIN
--        -- Insert only if not already present
--        INSERT INTO Manager_Access (Mgr_ID, Type_Service_ID)
--        SELECT R.Mgr_ID, TS.Type_Service_ID
--        FROM inserted R
--        JOIN Type_Service TS 
--          ON TS.Service_PK = R.Restaurant_ID 
--         AND TS.Type_Service = 'Restaurant';
--    END
--END;
--GO

--CREATE TRIGGER trg_insert_manager_access_ground
--ON Grounds
--AFTER INSERT
--AS
--BEGIN
--    -- Check if the combination already exists in Manager_Access
--    IF NOT EXISTS (
--        SELECT 1
--        FROM Manager_Access MA
--        JOIN inserted G ON MA.Mgr_ID = G.Mgr_ID
--        JOIN Type_Service TS ON TS.Service_PK = G.G_ID 
--        WHERE TS.Type_Service = 'Ground'
--    )
--    BEGIN
--        -- Insert only if not already present
--        INSERT INTO Manager_Access (Mgr_ID, Type_Service_ID)
--        SELECT G.Mgr_ID, TS.Type_Service_ID
--        FROM inserted G
--        JOIN Type_Service TS 
--          ON TS.Service_PK = G.G_ID 
--         AND TS.Type_Service = 'Ground';
--    END
--END;
--GO

--CREATE PROCEDURE AddRestaurant
--    @Restaurant_Name VARCHAR(100),
--    @Mgr_ID INT,
--    @Email VARCHAR(255),
--    @Phone VARCHAR(20),
--    @Location VARCHAR(255)
--AS
--BEGIN
--    SET NOCOUNT ON;

--    INSERT INTO Restaurants (Restaurant_Name, Mgr_ID, Email, Phone, Location, Restaurant_Status) VALUES 
--		(@Restaurant_Name, @Mgr_ID, @Email, @Phone, @Location, 'Open');
--END;
--GO

--CREATE TRIGGER trg_UpdateAmountTotal_AfterFoodItemsInsert
--ON Food_Order_Items
--AFTER INSERT
--AS
--BEGIN
--    SET NOCOUNT ON;

--    UPDATE fo
--    SET fo.Amount_Total = (
--        SELECT SUM(foi.Quantity * m.Item_Amount)
--        FROM Food_Order_Items foi
--        JOIN Menu m ON foi.Item_ID = m.Item_ID
--        WHERE foi.FOrder_ID = fo.FOrder_ID
--    )
--    FROM Food_Orders fo
--    JOIN inserted i ON fo.FOrder_ID = i.FOrder_ID;
--END;
--GO

--CREATE TRIGGER trg_DeductStock_AfterFoodItemsInsert
--ON Food_Order_Items
--AFTER INSERT
--AS
--BEGIN
--    SET NOCOUNT ON;

--    UPDATE m
--    SET m.Stock = m.Stock - i.Quantity
--    FROM Menu m
--    JOIN inserted i ON m.Item_ID = i.Item_ID;
--END;
--GO

--CREATE TRIGGER trg_AutoPayment_ForFoodOrder
--ON Food_Orders
--AFTER INSERT, UPDATE
--AS
--BEGIN
--    SET NOCOUNT ON;

--    -- Handle new insertions
--    IF EXISTS (SELECT 1 FROM inserted WHERE FOrder_ID NOT IN (SELECT FOrder_ID FROM deleted))
--    BEGIN
--        INSERT INTO Payments (Roll_No, Type_Service_ID, Order_ID, Amount_Total, Payment_Type, Status)
--        SELECT
--            u.Roll_No,
--            (SELECT Type_Service_ID FROM Type_Service ts WHERE ts.Service_PK = u.Restaurant_ID AND ts.Type_Service = 'Restaurant'),
--            u.FOrder_ID,
--            u.Amount_Total,
--            'Cash',      -- Default; update via backend later
--            'Unpaid'     -- Default; change to 'Paid' after confirmation
--        FROM inserted u;
--    END

--    -- Handle updates (only when the total amount changes)
--    IF EXISTS (SELECT 1 FROM inserted i JOIN deleted d ON i.FOrder_ID = d.FOrder_ID WHERE i.Amount_Total <> d.Amount_Total)
--    BEGIN
--        INSERT INTO Payments (Roll_No, Type_Service_ID, Order_ID, Amount_Total, Payment_Type, Status)
--        SELECT
--            u.Roll_No,
--            (SELECT Type_Service_ID FROM Type_Service ts WHERE ts.Service_PK = u.Restaurant_ID AND ts.Type_Service = 'Restaurant'),
--            u.FOrder_ID,
--            u.Amount_Total,
--            'Cash',      -- Default; update via backend later
--            'Unpaid'     -- Default; change to 'Paid' after confirmation
--        FROM inserted u
--        JOIN deleted d ON u.FOrder_ID = d.FOrder_ID
--        WHERE u.Amount_Total <> d.Amount_Total;
--    END
--END;
--GO

--CREATE TYPE FoodOrderItemsType AS TABLE
--(
--    Item_ID INT,
--    Quantity INT
--);

--CREATE PROCEDURE PlaceFoodOrder
--    @Roll_No INT,
--    @Restaurant_ID INT,
--    @Order_Time DATETIME,
--    @Total_Amount DECIMAL(10,2),
--    @Items FoodOrderItemsType READONLY -- Declare the table-valued parameter as READONLY
--AS
--BEGIN
--    BEGIN TRANSACTION;

--    BEGIN TRY
--        -- Insert into Food_Orders table
--        DECLARE @Order_ID INT;
        
--        INSERT INTO Food_Orders (Roll_No, Restaurant_ID, Order_Time, Amount_Total, Food_Status)
--        VALUES (@Roll_No, @Restaurant_ID, @Order_Time, @Total_Amount, 'Pending');
        
--        -- Get the Order ID of the newly inserted order
--        SET @Order_ID = SCOPE_IDENTITY();
        
--        -- Insert into Food_Order_Items table for each item
--        INSERT INTO Food_Order_Items (FOrder_ID, Item_ID, Quantity)
--        SELECT @Order_ID, Item_ID, Quantity
--        FROM @Items;
        
--        COMMIT TRANSACTION;
--    END TRY
--    BEGIN CATCH
--        ROLLBACK TRANSACTION;
--        THROW;
--    END CATCH;
--END;


--CREATE VIEW ActiveFoodOrders AS
--SELECT 
--		  fo.Roll_No,
--          fo.FOrder_ID,
--          r.Restaurant_Name,
--          STRING_AGG(CONCAT(m.Item_Name, ' (', foi.Quantity, ')'), ', ') AS Item_Details,
--          fo.Amount_Total,
--          fo.Pickup_Time,
--          fo.Food_Status
--        FROM Food_Orders fo
--        INNER JOIN Food_Order_Items foi ON fo.FOrder_ID = foi.FOrder_ID
--        INNER JOIN Menu m ON foi.Item_ID = m.Item_ID
--        INNER JOIN Restaurants r ON fo.Restaurant_ID = r.Restaurant_ID
--        INNER JOIN Type_Service ts ON ts.Type_Service = 'Restaurant' AND ts.Service_PK = fo.Restaurant_ID
--        INNER JOIN Payments p ON p.Type_Service_ID = ts.Type_Service_ID AND p.Order_ID = fo.FOrder_ID
--        WHERE p.Status = 'Unpaid'
--        GROUP BY fo.Roll_No, fo.FOrder_ID, r.Restaurant_Name, fo.Amount_Total, fo.Pickup_Time, fo.Food_Status
--GO

--CREATE VIEW OldFoodOrders AS
--SELECT 
--		  fo.Roll_No,
--          fo.FOrder_ID,
--          r.Restaurant_Name,
--          STRING_AGG(CONCAT(m.Item_Name, ' (', foi.Quantity, ')'), ', ') AS Item_Details,
--          fo.Amount_Total,
--          fo.Pickup_Time,
--          fo.Food_Status
--        FROM Food_Orders fo
--        INNER JOIN Food_Order_Items foi ON fo.FOrder_ID = foi.FOrder_ID
--        INNER JOIN Menu m ON foi.Item_ID = m.Item_ID
--        INNER JOIN Restaurants r ON fo.Restaurant_ID = r.Restaurant_ID
--        INNER JOIN Type_Service ts ON ts.Type_Service = 'Restaurant' AND ts.Service_PK = fo.Restaurant_ID
--        INNER JOIN Payments p ON p.Type_Service_ID = ts.Type_Service_ID AND p.Order_ID = fo.FOrder_ID
--        WHERE p.Status = 'Paid'
--        GROUP BY fo.Roll_No, fo.FOrder_ID, r.Restaurant_Name, fo.Amount_Total, fo.Pickup_Time, fo.Food_Status
--GO

--CREATE TRIGGER trg_UpdateAmountTotal_AfterBookItemsInsert
--ON Book_Order_Items
--AFTER INSERT
--AS
--BEGIN
--    SET NOCOUNT ON;

--    UPDATE bo
--    SET bo.Amount_Total = (
--        SELECT SUM(boi.Quantity * b.Book_Amount)
--        FROM Book_Order_Items boi
--        JOIN Books b ON boi.Book_ID = b.Book_ID
--        WHERE boi.BOrder_ID = bo.BOrder_ID
--    )
--    FROM Book_Orders bo
--    JOIN inserted i ON bo.BOrder_ID = i.BOrder_ID;
--END;
--GO

--CREATE TRIGGER trg_DeductStock_AfterBookItemsInsert
--ON Book_Order_Items
--AFTER INSERT
--AS
--BEGIN
--    SET NOCOUNT ON;

--    UPDATE b
--    SET b.Stock = b.Stock - i.Quantity
--    FROM Books b
--    JOIN inserted i ON b.Book_ID = i.Book_ID;
--END;
--GO


--CREATE TYPE BookOrderItemType AS TABLE
--(
--    Book_ID INT,
--    Quantity INT
--);
--GO

--CREATE PROCEDURE PlaceBookOrder
--    @Roll_No INT,
--    @Order_Time DATETIME,
--    @Total_Amount DECIMAL(10,2),
--    @Books BookOrderItemType READONLY -- Declare the table-valued parameter as READONLY
--AS
--BEGIN
--    BEGIN TRANSACTION;

--    BEGIN TRY
--        -- Insert into Food_Orders table
--        DECLARE @Photocopier_ID INT;
--        DECLARE @BOrder_ID INT;
        
--        INSERT INTO Photocopier(Roll_No, Service_Type, Mgr_ID, Total_Amount)
--        VALUES (@Roll_No, 'Book', (Select Mgr_ID from Manager_Access ma JOIN Type_Service ts ON ma.Type_Service_ID = ts.Type_Service_ID WHERE
--		ts.Type_Service = 'Photocopier'), @Total_Amount);
        
--        -- Get the Order ID of the newly inserted order
--        SET @Photocopier_ID = SCOPE_IDENTITY();

--		INSERT INTO Book_Orders(Amount_Total, Order_Time, Photocopier_ID) VALUES
--		(@Total_Amount, @Order_Time, @Photocopier_ID);
        
--		SET @BOrder_ID = SCOPE_IDENTITY();

--        -- Insert into Food_Order_Items table for each item
--        INSERT INTO Book_Order_Items (BOrder_ID, Book_ID, Quantity)
--		SELECT @BOrder_ID, Book_ID, Quantity FROM @Books

        
--        COMMIT TRANSACTION;
--    END TRY
--    BEGIN CATCH
--        ROLLBACK TRANSACTION;
--        THROW;
--    END CATCH;
--END;
--GO

--CREATE TRIGGER trg_AutoPayment_ForBookOrder
--ON Book_Orders
--AFTER INSERT, UPDATE
--AS
--BEGIN
--    SET NOCOUNT ON;

--    -- Handle new insertions
--    IF EXISTS (SELECT 1 FROM inserted WHERE BOrder_ID NOT IN (SELECT BOrder_ID FROM deleted))
--    BEGIN
--        INSERT INTO Payments (Roll_No, Type_Service_ID, Order_ID, Amount_Total, Payment_Type, Status)
--        SELECT
--            p.Roll_No,
--            (SELECT Type_Service_ID 
--             FROM Type_Service ts 
--             WHERE ts.Type_Service = 'Photocopier'),
--			p.Photocopier_ID,
--            b.Amount_Total,
--            'Cash',
--            'Unpaid'
--        FROM inserted b
--        JOIN Photocopier p ON b.Photocopier_ID = p.Photocopier_ID;
--    END

--    -- Handle updates to Amount_Total
--    IF EXISTS (
--        SELECT 1
--        FROM inserted i
--        JOIN deleted d ON i.BOrder_ID = d.BOrder_ID
--        WHERE i.Amount_Total <> d.Amount_Total
--    )
--    BEGIN
--        INSERT INTO Payments (Roll_No, Type_Service_ID, Order_ID, Amount_Total, Payment_Type, Status)
--        SELECT
--            p.Roll_No,
--            (SELECT Type_Service_ID 
--             FROM Type_Service ts 
--             WHERE ts.Type_Service = 'Photocopier'),
--            p.Photocopier_ID,
--            i.Amount_Total,
--            'Cash',
--            'Unpaid'
--        FROM inserted i
--        JOIN deleted d ON i.BOrder_ID = d.BOrder_ID
--        JOIN Photocopier p ON i.Photocopier_ID = p.Photocopier_ID
--        WHERE i.Amount_Total <> d.Amount_Total;
--    END
--END;
--GO


--CREATE VIEW ActiveBookOrders AS
--SELECT 
--          p.Roll_No,
--          bo.BOrder_ID AS Book_Order_ID,
--          STRING_AGG(CONCAT(b.Book_Name, ' (', boi.Quantity, ')'), ', ') AS Book_Details,
--          bo.Amount_Total AS Total_Amount,
--          bo.Order_Time
--FROM Book_Orders bo
--INNER JOIN Book_Order_Items boi ON bo.BOrder_ID = boi.BOrder_ID
--INNER JOIN Books b ON boi.Book_ID = b.Book_ID
--INNER JOIN Photocopier p ON p.Photocopier_ID = bo.Photocopier_ID
--INNER JOIN Payments pay ON pay.Order_ID = p.Photocopier_ID 
--WHERE pay.Status = 'Unpaid'  -- Filter for unpaid orders
--GROUP BY p.Roll_No, bo.BOrder_ID, bo.Amount_Total, bo.Order_Time
--GO

--CREATE VIEW OldBookOrders AS
--SELECT 
--          p.Roll_No,
--          bo.BOrder_ID AS Book_Order_ID,
--          STRING_AGG(CONCAT(b.Book_Name, ' (', boi.Quantity, ')'), ', ') AS Book_Details,
--          bo.Amount_Total AS Total_Amount,
--          bo.Order_Time
--FROM Book_Orders bo
--INNER JOIN Book_Order_Items boi ON bo.BOrder_ID = boi.BOrder_ID
--INNER JOIN Books b ON boi.Book_ID = b.Book_ID
--INNER JOIN Photocopier p ON p.Photocopier_ID = bo.Photocopier_ID
--INNER JOIN Payments pay ON pay.Order_ID = p.Photocopier_ID
--WHERE pay.Status = 'Paid'  -- Filter for unpaid orders
--GROUP BY p.Roll_No, bo.BOrder_ID, bo.Amount_Total, bo.Order_Time
--GO

--CREATE PROCEDURE AddPrintTypeWithPricing
--    @Type_Name VARCHAR(50),
--    @Price_Per_Page DECIMAL(10,2)
--AS
--BEGIN
--    SET NOCOUNT ON;

--    -- Insert into Print_Types
--    INSERT INTO Print_Types (Type_Name)
--    VALUES (@Type_Name);

--    -- Get the newly inserted Type_ID
--    DECLARE @NewTypeID INT = SCOPE_IDENTITY();

--    -- Insert into Print_Type_Pricing
--    INSERT INTO Print_Type_Pricing (Type_ID, Price_Per_Page)
--    VALUES (@NewTypeID, @Price_Per_Page);
--END;

--CREATE PROCEDURE PlacePrintJob
--	@Roll_No INT,
--    @Type_ID INT,
--    @Doc_Info NVARCHAR(MAX),
--    @Total_Amount INT,
--    @No_Pages INT -- Declare the table-valued parameter as READONLY
--AS
--BEGIN
--    BEGIN TRANSACTION;

--    BEGIN TRY
--        -- Insert into Food_Orders table
--        DECLARE @Photocopier_ID INT;
        
--        INSERT INTO Photocopier(Roll_No, Service_Type, Mgr_ID, Total_Amount)
--        VALUES (@Roll_No, 'Print', (Select Mgr_ID from Manager_Access ma JOIN Type_Service ts ON ma.Type_Service_ID = ts.Type_Service_ID WHERE 
--		ts.Type_Service = 'Photocopier'), @Total_Amount);
        
--        -- Get the Order ID of the newly inserted order
--        SET @Photocopier_ID = SCOPE_IDENTITY();

--		INSERT INTO Print_Jobs (Type_ID, Photocopier_ID, Doc_Info, No_Pages) VALUES
--		(@Type_ID, @Photocopier_ID, @Doc_Info, @No_Pages);
        
        
--        COMMIT TRANSACTION;
--    END TRY
--    BEGIN CATCH
--        ROLLBACK TRANSACTION;
--        THROW;
--    END CATCH;
--END;

--CREATE TRIGGER trg_AutoPayment_ForPrintJob
--ON Print_Jobs
--AFTER INSERT, UPDATE
--AS
--BEGIN
--    SET NOCOUNT ON;

--    -- Handle new insertions
--    IF EXISTS (SELECT 1 FROM inserted WHERE Print_Job_ID NOT IN (SELECT Print_Job_ID FROM deleted))
--    BEGIN
--        INSERT INTO Payments (Roll_No, Type_Service_ID, Order_ID, Amount_Total, Payment_Type, Status)
--        SELECT
--            p.Roll_No,
--            (SELECT Type_Service_ID 
--             FROM Type_Service ts 
--             WHERE ts.Type_Service = 'Photocopier'),
--            i.Photocopier_ID,
--            p.Total_Amount,
--            'Cash',
--            'Unpaid'
--        FROM inserted i
--        JOIN Photocopier p ON i.Photocopier_ID = p.Photocopier_ID;
--    END

--    -- Handle updates in case Print Job is modified in a way that would affect payment
--    IF EXISTS (
--        SELECT 1
--        FROM inserted i
--        JOIN deleted d ON i.Print_Job_ID = d.Print_Job_ID
--        WHERE i.No_Pages <> d.No_Pages OR i.Type_ID <> d.Type_ID
--    )
--    BEGIN
--        INSERT INTO Payments (Roll_No, Type_Service_ID, Order_ID, Amount_Total, Payment_Type, Status)
--        SELECT
--            p.Roll_No,
--            (SELECT Type_Service_ID 
--             FROM Type_Service ts 
--             WHERE ts.Type_Service = 'Photocopier'),
--            i.Photocopier_ID,
--            p.Total_Amount,
--            'Cash',
--            'Unpaid'
--        FROM inserted i
--        JOIN deleted d ON i.Print_Job_ID = d.Print_Job_ID
--        JOIN Photocopier p ON i.Photocopier_ID = p.Photocopier_ID
--        WHERE i.No_Pages <> d.No_Pages OR i.Type_ID <> d.Type_ID;
--    END
--END;
--GO

--CREATE VIEW ActivePrintOrders AS
--SELECT 
--          p.Roll_No,
--          pj.Print_Job_ID AS Print_Job_ID,
--          CONCAT(pt.Type_Name, ' (', pj.No_Pages, ')') AS Job_Details,
--          p.Total_Amount AS Total_Amount
--FROM Print_Jobs pj
--INNER JOIN Print_Types pt ON pj.Type_ID = pt.Type_ID
--INNER JOIN Photocopier p ON p.Photocopier_ID = pj.Photocopier_ID
--INNER JOIN Payments pay ON pay.Order_ID = p.Photocopier_ID
--WHERE pay.Status = 'Unpaid'  -- Filter for unpaid orders
--GROUP BY p.Roll_No, pj.Print_Job_ID, p.Total_Amount, pt.Type_Name, pj.No_Pages;
--GO


--CREATE VIEW OldPrintOrders AS
--SELECT 
--          p.Roll_No,
--          pj.Print_Job_ID AS Print_Job_ID,
--          CONCAT(pt.Type_Name, ' (', pj.No_Pages, ')') AS Job_Details,
--          p.Total_Amount AS Total_Amount
--FROM Print_Jobs pj
--INNER JOIN Print_Types pt ON pj.Type_ID = pt.Type_ID
--INNER JOIN Photocopier p ON p.Photocopier_ID = pj.Photocopier_ID
--INNER JOIN Payments pay ON pay.Order_ID = p.Photocopier_ID
--WHERE pay.Status = 'Paid'  -- Filter for paid orders
--GROUP BY p.Roll_No, pj.Print_Job_ID, p.Total_Amount, pt.Type_Name, pj.No_Pages;
--GO


 