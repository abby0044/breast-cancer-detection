#import pandas as pd

# Load the CSV file into a DataFrame
#input_csv = "image_data.csv"  # Replace with your input file path
#output_csv = "metadata.csv"  # Replace with your desired output file path

# Read the CSV
#df = pd.read_csv(input_csv)

# Create the image_id column by extracting the part of relative_path after the first '/'
#df['image_id'] = df['relative_path'].apply(lambda x: '/'.join(x.split('/', 1)[1:]))

# Save the updated DataFrame to a new CSV
#df.to_csv(output_csv, index=False)

#print(f"Updated CSV saved to {output_csv}")