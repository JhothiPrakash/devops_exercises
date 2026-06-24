resource "aws_dynamodb_table" "customers" {
  name           = "Customers"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "customerId"

  attribute {
    name = "customerId"
    type = "S"
  }

  tags = {
    Environment = "Development"
    Project     = "ex24"
  }
}